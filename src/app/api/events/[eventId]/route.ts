import { NextResponse } from "next/server";
import { match } from "ts-pattern";

import { ChoiceSource, DAYS_IN_WEEK, FreqEnum } from "~/constants";
import { hashId } from "~/services/hashId";
import { postgres } from "~/services/postgres";
import {
    DayJs,
    convertStringToDate,
    getCurrentDate,
    findInitialOccurenceForDate,
    newDateFromNativeDate,
} from "~/services/dayJsFacade";
import { decodeEventParamDate, parseRule } from "~/utils/eventUtils";
import {
    AvailabilityEnumValues,
    AvailabilityFromManual,
    AvailabilityFromRule,
    EventResponse,
    ID,
    ParsedRule,
    UsersAvailabilityChoices,
} from "~/typescript";

type Event = {
    event_id: string;
    name: string;
};

type MonthsChoices = {
    choice: AvailabilityEnumValues;
    day: number;
    month_id: ID;
    month: number;
    year: number;
    username: string;
};

type Rule = {
    id: ID;
    choice: AvailabilityEnumValues;
    rule: string;
    start_date: Date;
    username: string;
};

type TransformedRule = Rule & {
    selectedDays: number[];
    parsedRule: ParsedRule;
};

type EventUser = {
    id: ID;
    username: string;
};

type RouteParams = {
    eventId: string;
};

type RequestParams = {
    params: RouteParams;
};

const DayToNoMap = {
    MO: 1,
    TU: 2,
    WE: 3,
    TH: 4,
    FR: 5,
    SA: 6,
    SU: 7,
} as const;

type DayToMapyKeys = Array<keyof typeof DayToNoMap>;

function generateDaysForInterval(interval: number) {
    return function generateDaysFromInitialDays(
        currentDate: DayJs,
        arr: number[] = [],
    ) {
        const appendedDays = [...arr, currentDate.date()];
        const nextDate = currentDate.add(interval, "days");
        if (nextDate.month() !== currentDate.month()) {
            return appendedDays;
        }
        return generateDaysFromInitialDays(nextDate, appendedDays);
    };
}

/** TU,TH -> ['TU', 'TH'] */
function splitDayToNo(rule: ParsedRule) {
    return rule.BYDAY.split(",") as DayToMapyKeys;
}

function padInspectedDate(date: string) {
    const [month, year] = decodeEventParamDate(date);
    const paddedMonth = String(Number.parseInt(month) + 1).padStart(2, "0");
    return `01-${paddedMonth}-${year}`;
}

function calculateOccurrencesForRule(
    initialDate: DayJs,
    rule: ParsedRule,
    ruleCreationDate: Date,
) {
    const getNextOccurences = generateDaysForInterval(
        Number.parseInt(rule.INTERVAL) * DAYS_IN_WEEK,
    );
    const findInitialOccurence = findInitialOccurenceForDate(
        initialDate,
        ruleCreationDate,
        Number.parseInt(rule.INTERVAL),
    );

    return splitDayToNo(rule)
        .map((dayLabel) => DayToNoMap[dayLabel])
        .map((weekDay) => findInitialOccurence(weekDay))
        .filter((next) => next.month() === initialDate.month())
        .flatMap((day) => getNextOccurences(day));
}

function getDaysFromRuleForMonth(beginningOfMonth: DayJs) {
    return function (rule: ParsedRule, ruleCreationDate: Date) {
        return match(rule.FREQ)
            .with(FreqEnum.WEEKLY, () => {
                const earlierMonthThanRuleCreation =
                    beginningOfMonth.isBefore(ruleCreationDate) &&
                    beginningOfMonth.month() !== ruleCreationDate.getMonth();
                if (earlierMonthThanRuleCreation) {
                    return [];
                }

                const sameMonthAsRuleCreation =
                    beginningOfMonth.isBefore(ruleCreationDate);
                if (sameMonthAsRuleCreation) {
                    return calculateOccurrencesForRule(
                        newDateFromNativeDate(ruleCreationDate),
                        rule,
                        ruleCreationDate,
                    );
                }

                return calculateOccurrencesForRule(
                    beginningOfMonth,
                    rule,
                    ruleCreationDate,
                );
            })
            .otherwise(() => {
                throw new Error("Rrule Error: unhandled FREQ of this rrule");
            });
    };
}

function createEmptyUserChoices(users: EventUser[]) {
    return users.reduce((o, currUser) => {
        o[currUser.username] = [];
        return o;
    }, {} as UsersAvailabilityChoices);
}

function createChoicesMap(
    users: EventUser[],
    eventMonthChoices: MonthsChoices[],
) {
    const usersChache = users.reduce(
        (cache, { username }) => {
            cache[username] = new Set();
            return cache;
        },
        {} as Record<string, Set<number>>,
    );
    const choicesCache = eventMonthChoices.reduce(
        (cache, { username, day }) => {
            cache[username].add(day);
            return cache;
        },
        usersChache,
    );
    return choicesCache;
}

type RuleChoiceObject = {
    day: number;
    availability: AvailabilityEnumValues;
    ruleId: ID;
};
function createChoiceFromRule(
    properties: RuleChoiceObject,
): AvailabilityFromRule {
    return {
        ...properties,
        type: ChoiceSource.FROM_RULE,
    };
}

type ManualChoiceObject = {
    day: number;
    availability: AvailabilityEnumValues;
};
function createChoiceFromManual(
    properties: ManualChoiceObject,
): AvailabilityFromManual {
    return {
        ...properties,
        type: "MANUAL",
    };
}

function combineChoices(
    users: EventUser[],
    parsedRules: TransformedRule[],
    eventMonthChoices: MonthsChoices[],
) {
    const groupedUsers = createEmptyUserChoices(users);
    const manualChoicesMap = createChoicesMap(users, eventMonthChoices);

    parsedRules.forEach(({ choice, username, selectedDays, id }) => {
        selectedDays.forEach((day) => {
            if (!manualChoicesMap[username].has(day)) {
                const newChoice = createChoiceFromRule({
                    ruleId: id,
                    availability: choice,
                    day,
                });
                groupedUsers[username].push(newChoice);
            }
        });
    });

    eventMonthChoices.forEach(({ choice, day, username }) => {
        const newChoice = createChoiceFromManual({
            availability: choice,
            day,
        });
        groupedUsers[username].push(newChoice);
    });

    return groupedUsers;
}

function filterByDate(date: DayJs) {
    return postgres`
        AND m.year = ${date.year()}
        AND m.month = ${date.month()};
    `;
}

function createInspectedMonthFallback() {
    const currentDate = getCurrentDate({ utc: true });
    return `${currentDate.month}-${currentDate.year}`;
}

export async function GET(request: Request, { params }: RequestParams) {
    try {
        const { searchParams } = new URL(request.url);

        const [eventId, decodingError] = hashId.decode(params.eventId);
        if (decodingError) {
            return NextResponse.json(
                { message: "Event not found" },
                { status: 404 },
            );
        }

        const rawInspectionMonth = // expected format: MM-YYYY, MM starts from 0
            searchParams.get("date") ?? createInspectedMonthFallback();
        const inspectionMonth = padInspectedDate(rawInspectionMonth);
        const inspectionMonthDate = convertStringToDate(inspectionMonth);
        if (!inspectionMonthDate.isValid()) {
            return NextResponse.json(
                { message: "Date Error: could not convert date" },
                { status: 400 },
            );
        }

        const [event] = await postgres<Event[]>`
            SELECT
                e.id AS event_id,
                e.name
            FROM event.events AS e
            WHERE e.id = ${eventId};
        `;
        if (!event) {
            return NextResponse.json(
                { message: "Event not found" },
                { status: 404 },
            );
        }

        const eventMonthChoices = await postgres<MonthsChoices[]>`
            SELECT
                m.id AS month_id,
                m.month,
                m.year,
                c.day,
                c.choice,
                u.username
            FROM event.events_months AS m
            JOIN event.availability_choices AS c ON c.event_month_id=m.id
            JOIN event.events_users AS u ON u.id=c.user_id
            WHERE
                m.event_id=${event.event_id}
                ${filterByDate(inspectionMonthDate)}
        `;

        const rules = await postgres<Rule[]>`
            SELECT
                r.id,
                r.choice,
                r.rule,
                r.start_date,
                u.username
            FROM event.availability_rules AS r
            JOIN event.events_users AS u ON u.id=r.user_id
            WHERE r.event_id=${event.event_id}
        `;

        const users = await postgres<EventUser[]>`
            SELECT id, username FROM event.events_users WHERE event_id = ${eventId};
        `;

        const getDaysFromRule = getDaysFromRuleForMonth(inspectionMonthDate);
        const parsedRules = rules
            .map((rule) => ({ ...rule, parsedRule: parseRule(rule.rule) }))
            .map((rule) => ({
                ...rule,
                selectedDays: getDaysFromRule(rule.parsedRule, rule.start_date),
            }));

        const usersChoices = combineChoices(
            users,
            parsedRules,
            eventMonthChoices,
        );

        const response: EventResponse = {
            name: event.name,
            time: rawInspectionMonth,
            usersChoices,
        };

        return NextResponse.json(response);
    } catch (error) {
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 },
        );
    }
}
