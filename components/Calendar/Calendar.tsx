"use client";

import { useEffect, useState, useTransition } from "react";

import {
    MonthDay,
    createMonthDays,
    getCurrentDate,
    getCurrentMonth,
    getCurrentYear,
} from "~/utils/date";
import { capitalize, chunks, truncateString, pipe } from "~/utils/utils";
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
    const choicesList = Object.values(choices);
    if (!choicesList.length) {
        return false;
    }

    return choicesList.every((choice) => choice === Availability.AVAILABLE);
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

function isToday(day: MonthDay) {
    const currentDate = getCurrentDate();
    return day.day === currentDate.day &&
        day.month === currentDate.month &&
        day.year === currentDate.year;
}

function getAvailabilityColor(availability: AvailabilityEnum) {
    if (!availability) {
        return 'hover:bg-white/10';
    }
    if (availability === Availability.AVAILABLE) {
        return 'bg-green-400 hover:bg-green-400/80';
    }
    if (availability === Availability.MAYBE_AVAILABLE) {
        return 'bg-orange-400 hover:bg-orange-400/80';
    }
    if (availability === Availability.NOT_AVAILABLE) {
        return 'bg-rose-400 hover:bg-rose-400/80';
    }
    throw new Error('unmatched availability type')
}

const trimWeekday = pipe(
    truncateString(3),
    capitalize
);

// CALENDAR component
// if you select the day the color changes
// if someone selects the day dot appears
// prefetch next and prev months
// select all
// clear all selections
export default function Calendar({ availability, eventId, username }: CalendarProps) {
    const [isPending, startTransition] = useTransition();

    const [currentMonth, setCurrentMonth] = useState(getCurrentMonth());
    const [currentYear, setCurrentYear] = useState(getCurrentYear())
    const [isDirty, setIsDirty] = useState(false);

    const monthDaysData = createMonthDays(currentMonth, currentYear);
    const monthDays = monthDaysData.map(({ day }) => day);
    const maxMonthDayNumber = Math.max(...monthDays);
    const chunkedMonth = [...chunks(monthDaysData, 7)];

    const userAvailability = username ? availability[username] : null;
    const extractedOwnChoices = userAvailability ? fillOwnChoices(userAvailability,  maxMonthDayNumber) : {};
    const [ownChoices, setOwnChoices] = useState<OwnAvailability>(extractedOwnChoices);
    const [ownChoicesBackup, setOwnChoicesBackup] = useState<OwnAvailability>(extractedOwnChoices);

    useEffect(() => {
        console.log('ToDo: recalculate choices on username change');
    }, [username]);

    const onPrevMonthClick = () => {
        if (currentMonth - 1 < 0) {
            setCurrentMonth(11);
            setCurrentYear((prev) => prev - 1);
            return;
        }

        setCurrentMonth((prev) => prev - 1);
    };

    const onNextMonthClick = () => {
        if (currentMonth + 1 > 11) {
            setCurrentMonth(0);
            setCurrentYear((prev) => prev + 1);
            return;
        }

        setCurrentMonth((prev) => prev + 1);
    };

    const onDayClick = ({ day, month }: MonthDay) => {
        if (!username) {
            return null;
        }

        if (month !== currentMonth) {
            return null;
        }

        // ToDo: change general availability
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
        // ToDo: update ownChoiceBackup
    };

    const onResetClick = () => {
        setOwnChoices(ownChoicesBackup);
        setIsDirty(false);
    }

    const usersChoices = fillUsersChoices(availability, maxMonthDayNumber);

    return (
        <>
            <div>
                <div className=" bg-gray-100 rounded-md p-3 my-3 m-auto bg-clip-padding backdrop-filter backdrop-blur-3xl bg-opacity-10 border border-white/25 max-w-sm">
                    <div className="flex justify-between items-center">
                        <button className="h-10 w-10 rounded-md hover:bg-white/10 transform active:scale-90 transition-transform" type="button" onClick={onPrevMonthClick}>{'<'}</button>
                        <p className="px-7">{capitalize(MONTHS[currentMonth])} {currentYear}</p>
                        <button className="h-10 w-10 rounded-md hover:bg-white/10 transform active:scale-90 transition-transform" type="button" onClick={onNextMonthClick}>{'>'}</button>
                    </div>
                    <table className="table-fixed text-center w-full">
                        <thead>
                            <tr>
                                {WEEKDAYS.map((weekday) => <td key={weekday} className="py-3">{trimWeekday(weekday)}</td>)}
                            </tr>
                        </thead>
                        <tbody>
                            {chunkedMonth.map((week) => (
                                <tr key={week.key}>
                                    {week.chunk.map((dayData) => (
                                        <td key={dayData.key} onClick={() => onDayClick(dayData)}>
                                            <div className="aspect-square relative">
                                                <button className={
                                                    `w-full h-full
                                                    ${dayData.month === currentMonth ? 'transform active:scale-75 transition-transform' : 'opacity-50'}
                                                    ${isToday(dayData) ? 'rounded-full' : 'rounded-md'}
                                                    ${isToday(dayData) && !ownChoices[dayData.day] ? 'bg-white/10' : ''}
                                                    ${dayData.month === currentMonth && getAvailabilityColor(ownChoices[dayData.day])}
                                                    ${dayData.month === currentMonth && areAllAvailable(usersChoices[dayData.day]) ? 'bg-gradient-to-br from-orange-400 via-rose-500 to-teal-400 animate-wave bg-[length:600%]' : ''}
                                                `} type="button" disabled={dayData.month !== currentMonth}>{dayData.day}</button>
                                                <div className="flex gap-1 justify-center absolute top-[90%] left-1/2 transform -translate-x-1/2 -translate-y-[90%]">
                                                    {dayData.month === currentMonth && Object
                                                        .entries(usersChoices[dayData.day])
                                                        .map(([user, choice]) => <span key={user} className={`rounded-full h-2 w-2 border border-black ${getAvailabilityColor(choice)}`} />)
                                                    }
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
            {/* Move this part to different component */}
            {/* Also move this part to the bottom of the page */}
            <div className="flex self-end md:self-center">
                {isDirty && <button className="bg-red-400 flex-auto mx-2 py-2 rounded-md" type="reset" onClick={onResetClick}>Reset changes</button>}
                {isDirty && <button className="bg-green-400 flex-auto mx-2 py-2 rounded-md" type="submit" onClick={onSubmitClick}>Submit changes</button>}
            </div>
        </>
    );
}

// hover:bg-neutral-600

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
