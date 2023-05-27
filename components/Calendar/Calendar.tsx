"use client";

import { useEffect, useState, useTransition } from "react";

import {
    MonthDay,
    createMonthDays,
    getCurrentDay,
    getCurrentMonth,
} from "~/utils/date";
import { chunks } from "~/utils/utils";
import { changeAvailability } from "~/app/api/calendar/[id]/actions";
import { Availability, UsersAvailability } from "../../typescript";

const Availability = {
    MAYBE_AVAILABLE: 'MAYBE_AVAILABLE',
    NOT_AVAILABLE: 'NOT_AVAILABLE',
    AVAILABLE: 'AVAILABLE'
} as const;

type AvailabilityEnum = keyof typeof Availability;
type CalendarProps = {
    availability: UsersAvailability;
    eventId: string;
    username: string | undefined;
}
type DayAvailability = {
    user: string;
    choice: string;
}
type EmptyDays = Record<number, DayAvailability[]>
type OwnAvailability = Record<string, AvailabilityEnum>
type AllAvailability = Record<string, { [k: string]: AvailabilityEnum }>;

export const WEEKDAYS = [
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
    'sunday',
] as const;

export const MONTHS = [
    'january',
    'february',
    'march',
    'april',
    'may',
    'june',
    'july',
    'august',
    'september',
    'october',
    'november',
    'december',
] as const;

function createEmptyDays(numberOfDaysInMonth: number = 0): EmptyDays {
    return Array
        .from<number>({ length: numberOfDaysInMonth })
        .reduce((acc, _, index) => ({ ...acc, [index + 1]: [] }), {});
};

function searchChoicesForMatch(choices: Availability, condition: number) {
    if (choices.available.some((day) => condition === day)) {
        return Availability.AVAILABLE;
    }

    if (choices.maybeAvailable.some((day) => condition === day)) {
        return Availability.MAYBE_AVAILABLE;
    }

    if (choices.notAvailable.some((day) => condition === day)) {
        return Availability.NOT_AVAILABLE;
    }

    return null;
}

function areAllAvailable(choices: Record<string, string | null>) {
    return Object.values(choices).every((choice) => choice === Availability.AVAILABLE);
}

function fillUsersChoices(usersChoices: UsersAvailability, maxMonthDay: number) {
    const choices: AllAvailability = {};
    const emptyDays = createEmptyDays(maxMonthDay);

    Object.keys(emptyDays).forEach((day) => {
        const usersDayChoices: OwnAvailability = {};
        Object.entries(usersChoices).forEach(([users, userChoices]) => {
            const type = searchChoicesForMatch(userChoices, Number.parseInt(day));
            if (!type) {
                return;
            }
            usersDayChoices[users] = type;
        });
        choices[day] = usersDayChoices;
    });

    return choices;
}

function fillOwnChoices(choices: Availability, maxMonthDay: number) {
    const ownChoices: OwnAvailability = {};
    const emptyDays = createEmptyDays(maxMonthDay);

    Object.keys(emptyDays).forEach((i) => {
        const type = searchChoicesForMatch(choices, Number.parseInt(i));
        if (!type) {
            return;
        }
        ownChoices[i] = type;
    });

    return ownChoices;
}

// ToDo: use circular data structure
function getNextChoice(currentChoice: string) {
    if (currentChoice === Availability.AVAILABLE) {
        return Availability.MAYBE_AVAILABLE;
    }

    if (currentChoice === Availability.MAYBE_AVAILABLE) {
        return Availability.NOT_AVAILABLE;
    }

    return Availability.AVAILABLE;
}

// CALENDAR component
// if you select the day the color changes
// if someone selects the day dot appears
// prefetch next and prev months
export default function Calendar({ availability, eventId, username }: CalendarProps) {
    const [isPending, startTransition] = useTransition();

    const [currentMonth, setCurrentMonth] = useState(getCurrentMonth);
    const [isDirty, setIsDirty] = useState(false);

    const monthDaysData = createMonthDays(currentMonth);
    const monthDays = monthDaysData.map(({ day }) => day);
    const maxMonthDayNumber = Math.max(...monthDays);
    const currentDay = getCurrentDay();
    const chunkedMonth = [...chunks(monthDaysData, 7)];

    const userAvailability = username ? availability[username] : null;
    const extractedOwnChoices = userAvailability ? fillOwnChoices(userAvailability,  maxMonthDayNumber) : {};
    const [ownChoices, setOwnChoices] = useState<OwnAvailability>(extractedOwnChoices);
    const [ownChoicesBackup, setOwnChoicesBackup] = useState<OwnAvailability>(extractedOwnChoices);

    useEffect(() => {
        console.log('ToDo: recalculate choices on username change');
    }, [username]);

    const onPrevMonthClick = () => {
        setCurrentMonth((prev) => prev - 1);
    };

    const onNextMonthClick = () => {
        setCurrentMonth((prev) => prev + 1);
    };

    const onDayClick = ({ day, month }: MonthDay) => {
        if (!username) {
            return null;
        }

        if (month !== currentMonth) {
            return null;
        }

        const ownChoicesClone = structuredClone(ownChoices);
        const currentChoice = ownChoicesClone[day];
        const nextChoice = getNextChoice(currentChoice)
        
        ownChoicesClone[day] = nextChoice;

        setOwnChoices(ownChoicesClone);
        setIsDirty(true);
    };

    const onSubmitClick = () => {
        startTransition(() => changeAvailability(eventId, ownChoices))
        setIsDirty(false);
        // update ownChoiceBackup
    };

    const onResetClick = () => {
        setOwnChoices(ownChoicesBackup);
        setIsDirty(false);
    }

    const usersChoices = fillUsersChoices(availability, maxMonthDayNumber);

    return (
        <div>
            <div className="flex">
                <button type="button" onClick={onPrevMonthClick}>{'<'}</button>
                <p>{MONTHS.at(currentMonth)}</p>
                <button type="button" onClick={onNextMonthClick}>{'>'}</button>
            </div>
            <table>
                <thead>
                    <tr>
                        {WEEKDAYS.map((month) => <td key={month}>{month}</td>)}
                    </tr>
                </thead>
                <tbody>
                    {chunkedMonth.map((week) => (
                        <tr key={week.key}>
                            {week.chunk.map((dayData) => (
                                <td key={dayData.key} onClick={() => onDayClick(dayData)}>
                                    <div>
                                        <button type="button">{dayData.day}</button>
                                        {dayData.month === currentMonth && dayData.day === currentDay && <p>Today</p>}
                                        {dayData.month === currentMonth && ownChoices[dayData.day]}
                                        {dayData.month === currentMonth && Object
                                            .entries(usersChoices[dayData.day])
                                            .map(([user]) => <p key={user}>.</p>)
                                        }
                                        {dayData.month === currentMonth && areAllAvailable(usersChoices[dayData.day])}
                                        {dayData.month === currentMonth && <div>
                                            <p>Tooltip</p>
                                            {Object
                                                .entries(usersChoices[dayData.day])
                                                .map(([user, choice]) => <p key={user}>{user} - {choice}</p>)
                                            }
                                        </div>}
                                    </div>
                                </td>
                            ))}
                        </tr>
                    ))} 
                </tbody>
            </table>
            {/* Move this part to different component */}
            {isDirty && <button type="reset" onClick={onResetClick}>Reset changes</button>}
            {isDirty && <button type="submit" onClick={onSubmitClick}>Submit changes</button>}
        </div>
    );
}

// IMMUTABLE version of fill own choices function
// function fillOwnChoices(choices: Availability, maxMonthDay: number) {
//     const emptyDays = createEmptyDays(maxMonthDay);
//     const ownChoices = Object.keys(emptyDays)
//         .map((i) => {
//             const type = searchChoicesForMatch(choices, Number.parseInt(i));
//             return { key: i, value: type };
//         })
//         .filter((item) => item.value !== undefined)
//         .reduce((acc, item) => {
//             return Object.assign({}, acc, { [item.key]: item.value });
//         }, {} as Record<string, string>);
//     return ownChoices;
// }
