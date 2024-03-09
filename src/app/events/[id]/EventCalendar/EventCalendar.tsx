import { useMemo } from "react";
import { useAtom } from "jotai";
import { useParams } from "next/navigation";

import { capitalize, truncateString, pipe, chunks, isNil } from "~/std";
import { AvailabilityEnum } from "~/constants";
import { calendarDateAtoms } from "~/atoms";
import { useEventQuery } from "~/queries/useEventQuery";
import { useEventUsersQuery } from "~/queries/useEventUsersQuery";
import {
    MonthDay,
    MonthDayToDate,
    createMonthDays,
    newDateFromNativeDate,
} from "~/services/dayJsFacade";
import {
    parseEventToCalendarChoices,
    parseEventToOwnChoices,
} from "~/utils/eventUtils";
import { useAnonAuth } from "~/hooks/use-anon-auth";
import { LoadingSpinner } from "~/components/LoadingSpinner/LoadingSpinner";
import {
    AllAvailability,
    AvailabilityEnumValues,
    EventRouteParams,
    OwnAvailability,
    ReactProps,
} from "~/typescript";

const DayColorTypeEnum = {
    MY_AVAILABLE: "MY_AVAILABLE",
    MAYBE_AVAILABLE: "MAYBE_AVAILABLE",
    UNAVAILABLE: "UNAVAILABLE",
    ALL_SELECTED: "ALL_SELECTED",
    UNSELECTED: "UNSELECTED",
    DISABLED: "DISABLED",
} as const;

type DayColorType =
    | "MY_AVAILABLE"
    | "MAYBE_AVAILABLE"
    | "UNAVAILABLE"
    | "ALL_SELECTED"
    | "UNSELECTED"
    | "DISABLED";

const WEEKDAYS = [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
] as const;

const MONTHS = [
    "january",
    "february",
    "march",
    "april",
    "may",
    "june",
    "july",
    "august",
    "september",
    "october",
    "november",
    "december",
] as const;

const dayColor: Record<DayColorType, string> = {
    ALL_SELECTED:
        "bg-blue-300 [@media(hover:hover)]:hover:bg-blue-300/80 text-neutral-800",
    MAYBE_AVAILABLE:
        "bg-orange-300 [@media(hover:hover)]:hover:bg-orange-300/80 text-neutral-800",
    MY_AVAILABLE:
        "bg-accent [@media(hover:hover)]:hover:bg-accent/80 text-neutral-800",
    UNAVAILABLE:
        "bg-rose-300 [@media(hover:hover)]:hover:bg-rose-300/80 text-neutral-800",
    UNSELECTED: "hover:bg-white/10",
    DISABLED: "opacity-50",
} as const;

const ownAvailabilityChoice: Record<AvailabilityEnumValues, DayColorType> = {
    [AvailabilityEnum.AVAILABLE]: DayColorTypeEnum.MY_AVAILABLE,
    [AvailabilityEnum.MAYBE_AVAILABLE]: DayColorTypeEnum.MAYBE_AVAILABLE,
    [AvailabilityEnum.UNAVAILABLE]: DayColorTypeEnum.UNAVAILABLE,
} as const;

function isFromPast(monthDay: MonthDay) {
    const date = MonthDayToDate(monthDay);
    const currentDate = newDateFromNativeDate();
    return date.isBefore(currentDate, "day");
}

function areAllAvailable(choices: OwnAvailability, usersCount: number) {
    const choicesList = Object.values(choices);
    if (!choicesList.length) {
        return false;
    }
    if (choicesList.length !== usersCount) {
        return false;
    }
    return choicesList.every((choice) => choice === AvailabilityEnum.AVAILABLE);
}

function getColorType(
    day: MonthDay,
    selectedMonth: number,
    usersCount: number | undefined,
    allChoices: AllAvailability | null,
    ownChoice: OwnAvailability | null,
    noUser: boolean,
): DayColorType {
    if (noUser) {
        return DayColorTypeEnum.DISABLED;
    }
    if (!allChoices) {
        return DayColorTypeEnum.UNSELECTED;
    }
    if (!ownChoice) {
        return DayColorTypeEnum.UNSELECTED;
    }
    if (selectedMonth !== day.month) {
        return DayColorTypeEnum.DISABLED;
    }
    if (isFromPast(day)) {
        return DayColorTypeEnum.DISABLED;
    }
    const allChoicesForDay: OwnAvailability = allChoices[day.day];
    if (!allChoicesForDay) {
        throw new Error("get_color_type error: undefined choice");
    }
    if (usersCount && areAllAvailable(allChoicesForDay, usersCount)) {
        return DayColorTypeEnum.ALL_SELECTED;
    }
    const ownChoiceForDay: AvailabilityEnumValues = ownChoice[day.day];
    if (ownAvailabilityChoice[ownChoiceForDay]) {
        return ownAvailabilityChoice[ownChoiceForDay];
    }
    return DayColorTypeEnum.UNSELECTED;
}

const trimWeekday = pipe(truncateString(3), capitalize);

type EventCalendarProps = ReactProps & {
    clientAllChoices: AllAvailability | null;
    clientOwnChoices: OwnAvailability | null;
    selectDay: (day: number) => void;
    resetChoices: () => void;
};

export function EventCalendar({
    clientAllChoices,
    clientOwnChoices,
    selectDay,
    resetChoices,
}: EventCalendarProps) {
    const { id: eventId } = useParams<EventRouteParams>();
    if (!eventId) {
        throw new Error("Missing event url param");
    }

    const [calendarDate] = useAtom(calendarDateAtoms.readDateAtom);
    const [, incrementMonth] = useAtom(calendarDateAtoms.incrementMonthAtom);
    const [, decrementMonth] = useAtom(calendarDateAtoms.decrementMonthAtom);

    const { username } = useAnonAuth(eventId);
    const { data: event, isFetching } = useEventQuery(eventId);
    const { data: users } = useEventUsersQuery(eventId);

    const chunkifiedMonth = useMemo(() => {
        const monthDaysData = createMonthDays(calendarDate);
        return [...chunks(monthDaysData, 7)];
    }, [calendarDate]);

    const ownChoices = useMemo(() => {
        if (!username) {
            return null;
        }
        if (!event) {
            return null;
        }
        return (
            clientOwnChoices ??
            parseEventToOwnChoices(event.usersChoices[username], calendarDate)
        );
    }, [calendarDate, clientOwnChoices, event, username]);

    const allChoices = useMemo(() => {
        if (!username) {
            return null;
        }
        if (!event) {
            return null;
        }
        return (
            clientAllChoices ??
            parseEventToCalendarChoices(event.usersChoices, calendarDate)
        );
    }, [calendarDate, clientAllChoices, event, username]);

    const _onDayClick = ({ day, month }: MonthDay) => {
        if (!username) {
            return;
        }
        if (month !== calendarDate.month) {
            return;
        }
        selectDay(day);
    };
    const _handleMonthDecrement = () => {
        decrementMonth();
        resetChoices();
    };
    const _handleMonthIncrement = () => {
        incrementMonth();
        resetChoices();
    };
    const _isSelectionDisabled = (fullDateObject: MonthDay) => {
        const isUser = username;
        const dateBelongsToDifferentMonth =
            fullDateObject.month !== calendarDate.month;
        return (
            !isUser || dateBelongsToDifferentMonth || isFromPast(fullDateObject)
        );
    };

    return (
        <div className="bg-card-background rounded-md max-w-sm m-auto my-1 p-3 relative">
            {isFetching && !event && (
                <div className="bg-card-background absolute w-full top-0 left-0 rounded-md z-10 flex justify-center items-center h-full">
                    <LoadingSpinner />
                </div>
            )}
            <div className="flex justify-between items-center">
                <button
                    aria-label="go to previous month"
                    className="h-10 w-10 rounded-md [@media(hover:hover)]:hover:bg-white/10 active:scale-90 transition-transform"
                    type="button"
                    onClick={_handleMonthDecrement}
                >
                    {"<"}
                </button>
                <p className="px-7">
                    {capitalize(MONTHS[calendarDate.month])} {calendarDate.year}
                </p>
                <button
                    aria-label="go to next month"
                    className="h-10 w-10 rounded-md [@media(hover:hover)]:hover:bg-white/10 active:scale-90 transition-transform"
                    type="button"
                    onClick={_handleMonthIncrement}
                >
                    {">"}
                </button>
            </div>
            <table className="table-fixed text-center w-full">
                <thead>
                    <tr>
                        {WEEKDAYS.map((weekday) => (
                            <th key={weekday} className="py-3 font-normal">
                                {trimWeekday(weekday)}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {chunkifiedMonth.map((week) => (
                        <tr key={week.key}>
                            {week.chunk.map((dayData) => (
                                <td key={dayData.key}>
                                    <div className="aspect-square relative">
                                        <button
                                            type="button"
                                            className={`w-full h-full disabled:cursor-not-allowed rounded-md
                                                        ${
                                                            dayData.month ===
                                                            calendarDate.month
                                                                ? "active:scale-75 transition-transform"
                                                                : ""
                                                        }
                                                        ${
                                                            dayColor[
                                                                getColorType(
                                                                    dayData,
                                                                    calendarDate.month,
                                                                    users?.length,
                                                                    allChoices,
                                                                    ownChoices,
                                                                    isNil(
                                                                        username,
                                                                    ),
                                                                )
                                                            ]
                                                        }
                                                    `}
                                            onMouseDown={(e) => {
                                                const isLeftClick =
                                                    e.button.valueOf() === 0;
                                                if (!isLeftClick) {
                                                    return;
                                                }
                                                _onDayClick(dayData);
                                            }}
                                            disabled={_isSelectionDisabled(
                                                dayData,
                                            )}
                                        >
                                            {dayData.day}
                                        </button>
                                    </div>
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
