"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";

import {
    AvailabilityEnum,
    AvailabilityEnumValues,
    EventActionEnum,
} from "~/constants";
import {
    MonthDay,
    getCurrentDate,
    getNextMonthDate,
    getPrevMonthDate,
} from "~/services/dayJsFacade";
import {
    capitalize,
    truncateString,
    pipe,
    getUsersFromChoices,
} from "~/utils/index";
import { useEvent } from "~/context/EventProvider";
import { useAnonAuth } from "~/hooks/use-anon-auth";
import { useAbort } from "~/hooks/use-abort";
import { EventResponse } from "~/typescript";

type OwnAvailability = Record<string, AvailabilityEnumValues>;

const DayColorTypeEnum = {
    MY_AVAILABLE: "MY_AVAILABLE",
    MAYBE_AVAILABLE: "MAYBE_AVAILABLE",
    UNAVAILABLE: "UNAVAILABLE",
    ALL_SELECTED: "ALL_SELECTED",
    DIFFERENT_MONTH: "DIFFERENT_MONTH",
    TODAY: "TODAY",
    UNSELECTED: "UNSELECTED",
} as const;

type DayColorType =
    | "MY_AVAILABLE"
    | "MAYBE_AVAILABLE"
    | "UNAVAILABLE"
    | "ALL_SELECTED"
    | "DIFFERENT_MONTH"
    | "TODAY"
    | "UNSELECTED";

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
        "bg-gradient-to-br from-sky-400 via-teal-400 to-emerald-400 animate-wave bg-[length:600%] hover:opacity-80 text-neutral-800",
    DIFFERENT_MONTH: "opacity-50",
    MAYBE_AVAILABLE: "bg-orange-300 hover:bg-orange-300/80 text-neutral-800",
    MY_AVAILABLE: "bg-emerald-300 hover:bg-emerald-300/80 text-neutral-800",
    UNAVAILABLE: "bg-rose-300 hover:bg-rose-300/80 text-neutral-800",
    TODAY: "bg-white/10",
    UNSELECTED: "hover:bg-white/10",
} as const;

const ownAvailabilityChoice: Record<AvailabilityEnumValues, DayColorType> = {
    [AvailabilityEnum.AVAILABLE]: DayColorTypeEnum.MY_AVAILABLE,
    [AvailabilityEnum.MAYBE_AVAILABLE]: DayColorTypeEnum.MAYBE_AVAILABLE,
    [AvailabilityEnum.UNAVAILABLE]: DayColorTypeEnum.UNAVAILABLE,
} as const;

function isToday(monthDay: MonthDay) {
    const currentDate = getCurrentDate();
    return (
        monthDay.day === currentDate.day &&
        monthDay.month === currentDate.month &&
        monthDay.year === currentDate.year
    );
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
    usersCount: number,
    allChoicesForDay: OwnAvailability,
    ownChoiceForDay: AvailabilityEnumValues,
): DayColorType {
    if (selectedMonth !== day.month) {
        return DayColorTypeEnum.DIFFERENT_MONTH;
    }
    if (!allChoicesForDay) {
        throw new Error("undefined choice");
    }
    if (areAllAvailable(allChoicesForDay, usersCount)) {
        return DayColorTypeEnum.ALL_SELECTED;
    }
    if (ownAvailabilityChoice[ownChoiceForDay]) {
        return ownAvailabilityChoice[ownChoiceForDay];
    }
    if (isToday(day)) {
        return DayColorTypeEnum.TODAY;
    }
    return DayColorTypeEnum.UNSELECTED;
}

const trimWeekday = pipe(truncateString(3), capitalize);

export function EventCalendar() {
    const { id: eventId } = useParams();
    if (!eventId) {
        throw new Error("Missing event url param");
    }

    const { username } = useAnonAuth();
    const abortSignal = useAbort();
    const {
        allChoices,
        ownChoices,
        calendarDate,
        getCurrentMonthInChunks,
        eventDispatch,
    } = useEvent();

    const usersCount = useMemo(
        () => getUsersFromChoices(allChoices).length,
        [allChoices],
    );

    const onPrevMonthClick = async () => {
        const newDate = getPrevMonthDate(calendarDate);

        async function initEventCalendar() {
            const { month, year } = newDate;
            const searchParams = new URLSearchParams({
                date: `${month}-${year}`,
            });
            const response = await fetch(
                `/api/events/${eventId}?${searchParams.toString()}`,
                { signal: abortSignal },
            );
            const event = (await response.json()) as EventResponse;
            eventDispatch({
                type: EventActionEnum.LOAD_CHOICES,
                payload: {
                    event,
                    username,
                },
            });
        }

        await initEventCalendar();
    };

    const onNextMonthClick = async () => {
        const newDate = getNextMonthDate(calendarDate);

        async function initEventCalendar() {
            const { month, year } = newDate;
            const searchParams = new URLSearchParams({
                date: `${month}-${year}`,
            });
            const response = await fetch(
                `/api/events/${eventId}?${searchParams.toString()}`,
                { signal: abortSignal },
            );
            const event = (await response.json()) as EventResponse;
            eventDispatch({
                type: EventActionEnum.LOAD_CHOICES,
                payload: {
                    event,
                    username,
                },
            });
        }

        await initEventCalendar();
    };

    const onDayClick = ({ day, month }: MonthDay) => {
        if (!username) {
            return null;
        }

        if (month !== calendarDate.month) {
            return null;
        }

        eventDispatch({
            type: EventActionEnum.DAY_SELECT,
            payload: { selectedDay: day, username },
        });
    };

    return (
        <div className="bg-neutral-700 rounded-md border border-zinc-900 max-w-sm m-auto my-1 p-3">
            <div className="flex justify-between items-center">
                <button
                    className="h-10 w-10 rounded-md hover:bg-white/10 active:scale-90 transition-transform"
                    type="button"
                    onClick={onPrevMonthClick}
                >
                    {"<"}
                </button>
                <p className="px-7">
                    {capitalize(MONTHS[calendarDate.month])} {calendarDate.year}
                </p>
                <button
                    className="h-10 w-10 rounded-md hover:bg-white/10 active:scale-90 transition-transform"
                    type="button"
                    onClick={onNextMonthClick}
                >
                    {">"}
                </button>
            </div>
            <table className="table-fixed text-center w-full">
                <thead>
                    <tr>
                        {WEEKDAYS.map((weekday) => (
                            <td key={weekday} className="py-3">
                                {trimWeekday(weekday)}
                            </td>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {getCurrentMonthInChunks().map((week) => (
                        <tr key={week.key}>
                            {week.chunk.map((dayData) => (
                                <td key={dayData.key}>
                                    <div className="aspect-square relative">
                                        <button
                                            className={`w-full h-full disabled:cursor-not-allowed
                                                        ${
                                                            dayData.month ===
                                                            calendarDate.month
                                                                ? "active:scale-75 transition-transform"
                                                                : ""
                                                        }
                                                        ${
                                                            isToday(dayData)
                                                                ? "rounded-full"
                                                                : "rounded-md"
                                                        }
                                                        ${
                                                            dayColor[
                                                                getColorType(
                                                                    dayData,
                                                                    calendarDate.month,
                                                                    usersCount,
                                                                    allChoices[
                                                                        dayData
                                                                            .day
                                                                    ],
                                                                    ownChoices[
                                                                        dayData
                                                                            .day
                                                                    ],
                                                                )
                                                            ]
                                                        }
                                                    `}
                                            type="button"
                                            onMouseDown={(e) => {
                                                const isLeftClick =
                                                    e.button.valueOf() === 0;
                                                if (!isLeftClick) {
                                                    return;
                                                }
                                                onDayClick(dayData);
                                            }}
                                            disabled={
                                                dayData.month !==
                                                calendarDate.month
                                            }
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
