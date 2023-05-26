"use client";

import { useState, useTransition } from "react";

import {
    MonthDay,
    createMonthDays,
    getCurrentDay,
    getCurrentMonth,
} from "~/utils/date";
import { chunks } from "~/utils/utils";
import { changeAvailability } from "~/app/api/calendar/[id]/actions";
import { Availability, UsersAvailability } from "../../typescript";

type CalendarProps = {
    availability: UsersAvailability;
}
type DayChoice = {
    user: string;
    choice: string;
}
type EmptyDays = Record<number, DayChoice[]>

const WEEKDAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const MONTHS = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'null', 'null', 'null', 'null'];

function createEmptyDays(numberOfDaysInMonth: number = 0): EmptyDays {
    return Array
        .from<number>({ length: numberOfDaysInMonth })
        .reduce((acc, _, index) => ({ ...acc, [index + 1]: [] }), {});
};

function searchChoicesForMatch(choices: Availability, condition: number) {
    if (choices.available.some((day) => condition === day)) {
        return 'available';
    }

    if (choices.maybeAvailable.some((day) => condition === day)) {
        return 'maybe_available';
    }

    if (choices.notAvailable.some((day) => condition === day)) {
        return 'not_available';
    }

    return null;
}

function areAllAvailable(choices: Record<string, string | null>) {
    return Object.values(choices).every((choice) => choice === 'available');
}

function fillUsersChoices(usersChoices: UsersAvailability['users'], maxMonthDay: number) {
    const choices: Record<string, { [k: string]: string }> = {};
    const emptyDays = createEmptyDays(maxMonthDay);

    Object.keys(emptyDays).forEach((day) => {
        const usersDayChoices: Record<string, string> = {};
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
    const ownChoices: Record<string, string> = {};
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

// CALENDAR component
// if you select the day the color changes
// if someone selects the day dot appears
// prefetch next and prev months
export default function Calendar({ availability }: CalendarProps) {
    // ToDo: ID hardcoded
    const eventId = '1';
    // ToDo: User hardcoded
    const user = 'orzel';

    const [isPending, startTransition] = useTransition();

    const [currentMonth, setCurrentMonth] = useState(getCurrentMonth);
    const [isDirty, setIsDirty] = useState(false);

    const monthDaysData = createMonthDays(currentMonth);
    const monthDays = monthDaysData.map(({ day }) => day);
    const maxMonthDayNumber = Math.max(...monthDays);

    const [ownChoices, setOwnChoices] = useState(() => fillOwnChoices(availability.users[user],  maxMonthDayNumber));
    const [ownChoicesBackup, setOwnChoicesBackup] = useState<Record<string, string>>({});

    const currentDay = getCurrentDay();
    const chunkedMonth = [...chunks(monthDaysData, 7)];

    const onPrevMonthClick = () => {
        setCurrentMonth((prev) => prev - 1);
    };

    const onNextMonthClick = () => {
        setCurrentMonth((prev) => prev + 1);
    };

    const onDayClick = ({ day }: MonthDay) => {
        setIsDirty(true);
        setOwnChoices((prev) => prev);
    };

    const onSubmitClick = () => {
        startTransition(() => changeAvailability(eventId, ownChoices))
        setIsDirty(false);
        // update ownChoiceBackup
    };

    const onResetClick = () => {
        setIsDirty(false);
        setOwnChoices(ownChoicesBackup);
    }

    const usersChoices = fillUsersChoices(availability.users, maxMonthDayNumber);

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
                                        <p>{dayData.day}</p>
                                        {dayData.day === currentDay && <p>Today</p>}
                                        {ownChoices[dayData.day]}
                                        {
                                            Object
                                                .entries(usersChoices[dayData.day])
                                                .map(([user]) => <p key={user}>.</p>)
                                        }
                                        {areAllAvailable(usersChoices[dayData.day])}
                                        <div>
                                            <p>Tooltip</p>
                                            {
                                                Object
                                                    .entries(usersChoices[dayData.day])
                                                    .map(([user, choice]) => <p key={user}>{user} - {choice}</p>)
                                            }
                                        </div>
                                    </div>
                                </td>
                            ))}
                        </tr>
                    ))} 
                </tbody>
            </table>
            {/* Move this part to different component */}
            {isDirty && <button type="reset">Reset changes</button>}
            {isDirty && <button type="submit">Submit changes</button>}
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
