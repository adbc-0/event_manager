import { stringToNumber } from "../std/string/stringToNumber";
import { getLastDayOfMonth } from "~/services/dayJsFacade";
import {
    UsersAvailabilityChoices,
    ParsedRule,
    AvailabilityChoices,
    OwnAvailability,
    CurrentDate,
    AllAvailability,
} from "../../typescript";

/** @description month index from 0 */
export function encodeEventParamDate(month: number, year: number) {
    return `${month}-${year}`;
}

export function decodeEventParamDate(date: string) {
    const [month, year] = date.split("-");
    return [month, year] as const;
}

// Example rule: FREQ=WEEKLY;INTERVAL=2;COUNT=8;WKST=SU;BYDAY=TU,TH
export function parseRule(rule: string): ParsedRule {
    const ruleEntries = rule.split(";").map((rulePair) => rulePair.split("="));
    return Object.fromEntries(ruleEntries) as ParsedRule;
}

type DayAvailability = {
    user: string;
    choice: string;
};
type EmptyDays = Record<number, DayAvailability[]>;

function createEmptyDays(daysInMonth = 0): EmptyDays {
    return Array.from<number>({ length: daysInMonth }).reduce(
        (acc, _, index) => ({ ...acc, [index + 1]: [] }),
        {},
    );
}

function searchChoicesForMatch(
    choices: AvailabilityChoices,
    searchedDay: number,
) {
    const choice = choices.find(({ day }) => day === searchedDay);
    if (!choice) {
        return null;
    }
    return choice.availability;
}

// ToDo: Mutation, use parseEventResponseToOwnChoices function within
export function parseEventToCalendarChoices(
    usersChoices: UsersAvailabilityChoices,
    eventDate: CurrentDate,
) {
    const choices: AllAvailability = {};

    const maxMonthDay = getLastDayOfMonth(eventDate);
    const emptyDays = createEmptyDays(maxMonthDay);

    Object.keys(emptyDays).forEach((day) => {
        const usersDayChoices: OwnAvailability = {};
        Object.entries(usersChoices).forEach(([users, userChoices]) => {
            const type = searchChoicesForMatch(
                userChoices,
                Number.parseInt(day),
            );
            if (!type) {
                return;
            }
            usersDayChoices[users] = type;
        });
        choices[stringToNumber(day)] = usersDayChoices;
    });

    return choices;
}

export function parseEventToOwnChoices(
    choices: AvailabilityChoices,
    eventDate: CurrentDate,
) {
    if (!choices) {
        return {};
    }

    const maxMonthDay = getLastDayOfMonth(eventDate);
    const emptyDays = createEmptyDays(maxMonthDay);

    return Object.keys(emptyDays).reduce((o, day) => {
        const choice = searchChoicesForMatch(choices, Number.parseInt(day));
        if (choice) {
            o[day] = choice;
        }
        return o;
    }, {} as OwnAvailability);
}
