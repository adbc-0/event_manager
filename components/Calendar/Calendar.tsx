"use client";

import { useMemo, useState, useTransition } from "react";

import {
    MonthDay,
    createMonthDays,
    getCurrentMonth,
} from "~/utils/date";
import { chunks } from "~/utils/utils";
import { changeAvailability } from "~/app/api/calendar/[id]/actions";

const weekdays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const months = ['January', 'February', 'March', 'April', 'May'];

// GET /calendar/{calendarId}
const usersChoices = [{
    date: 1,
    personalSelection: 'yes',
    selections: {
        maybe: '2',
        yes: '3',
        no: '1',
    }
}] as const;

function mergeChoices(month: MonthDay[], choices: typeof usersChoices) {
    return month.map((day) => {
        const choice = choices.find(
            (choice) => choice.date === day.day
        );
        return choice ? { ...day, ...choice } : day;
    });
}

// if you select the day the color changes
// if someone selects the day dot appears
// prefetch next and prev months

export default function Calendar() {
    const [isPending, startTransition] = useTransition();
    const [currentMonth, setCurrentMonth] = useState(getCurrentMonth);

    const month = useMemo(() => {
        const monthDays = createMonthDays(currentMonth);
        const monthWithChoices = mergeChoices(monthDays, usersChoices);
        return [...chunks(monthWithChoices, 7)];
    }, [currentMonth]);

    const onPrevMonthClick = () => {
        setCurrentMonth((prev) => prev - 1);
    };

    const onNextMonthClick = () => {
        setCurrentMonth((prev) => prev + 1);
    };

    // ToDo: ID chardcoded
    const onDayClick = (day: MonthDay) => startTransition(() => changeAvailability('1'));

    return (
        <div>
            <div className="flex">
                <button type="button" onClick={onPrevMonthClick}>{'<'}</button>
                <p>{months.at(currentMonth)}</p>
                <button type="button" onClick={onNextMonthClick}>{'>'}</button>
            </div>
            <table>
                <thead>
                    <tr>
                        {weekdays.map((month) => <td key={month}>{month}</td>)}
                    </tr>
                </thead>
                <tbody>
                    {month.map((week) => (
                        <tr key={week.key}>
                            {week.chunk.map((day) => (
                                <td key={day.key} onClick={() => console.log(day)}>{day.day}</td>
                            ))}
                        </tr>
                    ))} 
                </tbody>
            </table>
        </div>
    );
}