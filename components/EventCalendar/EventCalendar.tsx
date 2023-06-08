"use client";

import { useState, useTransition } from "react";
import { useParams } from "next/navigation";

import {
    MonthDay,
    getCurrentDate,
    getNextMonthDate,
    getPrevMonthDate,
} from "~/utils/date";
import { capitalize, truncateString, pipe } from "~/utils/utils";
import { useEvent } from "../../lib/context/EventProvider";
import { changeAvailability } from "~/app/api/events/[id]/actions";
import { useAuth } from "~/hooks/use-auth";
import { Button } from "../Button/Button";
import { Availability, EventResponse } from "../../typescript";

const Availability = {
    MAYBE_AVAILABLE: "MAYBE_AVAILABLE",
    NOT_AVAILABLE: "NOT_AVAILABLE",
    AVAILABLE: "AVAILABLE",
} as const;

type AvailabilityEnum = keyof typeof Availability;
type OwnAvailability = Record<string, AvailabilityEnum>;
type DayColorType =
    | "MY_AVAILABLE"
    | "MAYBE_AVAILABLE"
    | "NOT_AVAILABLE"
    | "ALL_SELECTED"
    | "DIFFERENT_MONTH"
    | "TODAY"
    | "UNSELECTED";

export const WEEKDAYS = [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
] as const;

export const MONTHS = [
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
        "bg-gradient-to-br from-sky-400 via-teal-400 to-green-400 animate-wave bg-[length:600%] hover:opacity-80 text-neutral-800",
    DIFFERENT_MONTH: "opacity-50",
    MAYBE_AVAILABLE: "bg-orange-400 hover:bg-orange-400/80 text-neutral-800",
    MY_AVAILABLE: "bg-green-400 hover:bg-green-400/80 text-neutral-800",
    NOT_AVAILABLE: "bg-rose-400 hover:bg-rose-400/80 text-neutral-800",
    TODAY: "bg-white/10",
    UNSELECTED: "hover:bg-white/10",
} as const;

const ownAvailabilityChoice: Record<AvailabilityEnum, DayColorType> = {
    [Availability.AVAILABLE]: "MY_AVAILABLE",
    [Availability.MAYBE_AVAILABLE]: "MAYBE_AVAILABLE",
    [Availability.NOT_AVAILABLE]: "NOT_AVAILABLE",
} as const;

function isToday(day: MonthDay) {
    const currentDate = getCurrentDate();
    return (
        day.day === currentDate.day &&
        day.month === currentDate.month &&
        day.year === currentDate.year
    );
}

function areAllAvailable(choices: OwnAvailability) {
    const choicesList = Object.values(choices);
    if (!choicesList.length) {
        return false;
    }

    return choicesList.every((choice) => choice === Availability.AVAILABLE);
}

// function getOwnChoiceColor(ownChoice: AvailabilityEnum): DayColorType {
//     return ownAvailabilityChoice[ownChoice] ?? 'UNSELECTED';
// }

function getColorType(
    day: MonthDay,
    selectedMonth: number,
    allChoices: OwnAvailability,
    ownChoice: AvailabilityEnum,
): DayColorType {
    if (selectedMonth !== day.month) {
        return "DIFFERENT_MONTH";
    }
    if (areAllAvailable(allChoices)) {
        return "ALL_SELECTED";
    }
    if (ownAvailabilityChoice[ownChoice]) {
        return ownAvailabilityChoice[ownChoice];
    }
    if (isToday(day)) {
        return "TODAY";
    }
    return "UNSELECTED";
}

const trimWeekday = pipe(truncateString(3), capitalize);

// ToDo: prefetch next and prev months
// ToDo: select all
// ToDo: clear all selections
// ToDo: dont have to show own choice bubble
// ToDo: dont have to show bubbles on matched days
// ToDo: Add list view
export default function EventCalendar() {
    const { id: eventId } = useParams();
    if (!eventId) {
        throw new Error("Missing event url param");
    }

    const { getUsername } = useAuth();
    const {
        allChoices,
        ownChoices,
        calendarDate,
        getCurrentMonthInChunks,
        eventDispatch,
    } = useEvent();
    const [, startTransition] = useTransition(); // [isPending, startTransition]

    const [isDirty, setIsDirty] = useState(false);

    const onPrevMonthClick = async () => {
        const newDate = getPrevMonthDate(calendarDate);

        async function initEventCalendar() {
            const { month, year } = newDate;
            const searchParams = new URLSearchParams({
                date: `${month}-${year}`,
            });
            const response = await fetch(
                `/api/events/${eventId}?${searchParams.toString()}`,
            );
            const [event] = (await response.json()) as EventResponse[];
            eventDispatch({
                type: "SET_CHOICES",
                payload: {
                    event,
                    username: getUsername()?.name,
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
            );
            const [event] = (await response.json()) as EventResponse[];
            eventDispatch({
                type: "SET_CHOICES",
                payload: {
                    event,
                    username: getUsername()?.name,
                },
            });
        }

        await initEventCalendar();
    };

    const onDayClick = ({ day, month }: MonthDay) => {
        if (!getUsername()?.name) {
            return null;
        }

        if (month !== calendarDate.month) {
            return null;
        }

        eventDispatch({
            type: "DAY_SELECT",
            payload: { selectedDay: day, username: getUsername()?.name },
        });
        setIsDirty(true);
    };

    const onSubmitClick = () => {
        startTransition(() => changeAvailability(eventId, ownChoices));
        setIsDirty(false);
    };

    const onResetClick = () => {
        eventDispatch({ type: "RESET_CHOICES" });
        setIsDirty(false);
    };

    return (
        <>
            <div>
                <div className="max-w-sm rounded-md my-3 m-auto border border-black">
                    <div className=" bg-gray-100 rounded-md p-3 bg-clip-padding backdrop-filter backdrop-blur-3xl bg-opacity-10 border border-white/25">
                        <div className="flex justify-between items-center">
                            <button
                                className="h-10 w-10 rounded-md hover:bg-white/10 transform active:scale-90 transition-transform"
                                type="button"
                                onClick={onPrevMonthClick}
                            >
                                {"<"}
                            </button>
                            <p className="px-7">
                                {capitalize(MONTHS[calendarDate.month])}{" "}
                                {calendarDate.year}
                            </p>
                            <button
                                className="h-10 w-10 rounded-md hover:bg-white/10 transform active:scale-90 transition-transform"
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
                                            <td
                                                key={dayData.key}
                                                onClick={() =>
                                                    onDayClick(dayData)
                                                }
                                            >
                                                <div className="aspect-square relative">
                                                    <button
                                                        className={`w-full h-full disabled:cursor-not-allowed
                                                        ${
                                                            dayData.month ===
                                                            calendarDate.month
                                                                ? "transform active:scale-75 transition-transform"
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
                                                        disabled={
                                                            dayData.month !==
                                                            calendarDate.month
                                                        }
                                                    >
                                                        {dayData.day}
                                                    </button>
                                                    <div className="flex gap-1 justify-center absolute top-[90%] left-1/2 transform -translate-x-1/2 -translate-y-[90%]">
                                                        {/* ToDo: Dont render if all selected */}
                                                        {/* {dayData.month === calendarDate.month && Object
                                                            .entries(allChoices[dayData.day])
                                                            .map(([user, choice]) => <span key={user} className={`rounded-full h-2 w-2 border border-black ${dayColor[getOwnChoiceColor(choice)]}`} />)
                                                        } */}
                                                    </div>
                                                    {/* {dayData.month === currentMonth && <div>
                                                        <p>Tooltip</p>
                                                        {Object
                                                            .entries(usersChoices[dayData.day])
                                                            .map(([user, choice]) => <p key={user}>{user} - {choice}</p>)
                                                        }
                                                    </div>} */}
                                                </div>
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            {/* Move this part to different component */}
            {/* Also move this part to the bottom of the page */}
            <div className="flex self-start md:w-128 md:justify-self-center">
                {isDirty && (
                    <Button
                        className="flex-auto mx-2"
                        theme="DISCARD"
                        type="reset"
                        onClick={onResetClick}
                    >
                        Reset
                    </Button>
                )}
                {isDirty && (
                    <Button
                        className="flex-auto mx-2"
                        theme="SAVE"
                        type="submit"
                        onClick={onSubmitClick}
                    >
                        Submit
                    </Button>
                )}
            </div>
        </>
    );
}
