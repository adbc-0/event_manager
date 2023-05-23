// facade for dayjs library
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { AtLeastOnePropertyOf } from "../../typescript";
import { range } from "./utils";

dayjs.extend(utc);

type NewMonth = {
    beginning: dayjs.Dayjs,
    end: dayjs.Dayjs
}

export type MonthDay = {
    key: string;
    day: number;
    month: number;
}

export function getCurrentMonth() {
    return dayjs().utc().month();
}

function newDate(day: number, month: number): MonthDay {
    return { day, month, key: `${day}-${month}` };
}

function newMonth({ beginning, end }: AtLeastOnePropertyOf<NewMonth>) {
    const fromDate = beginning ?? end!.startOf('month');
    const toDate = end ?? beginning!.endOf('month');
    const month = fromDate.month();
    return range(
        fromDate.date(),
        toDate.diff(fromDate, 'days') + 1,
        (i) => newDate(i, month)
    );
}

function daysToPrevMonday(date: dayjs.Dayjs) {
    const weekday = date.startOf('month').day();
    if (weekday === 0) {
        return 0;
    }

    return weekday - 1;
}

function daysToNextSunday(date: dayjs.Dayjs) {
    const weekday = date.endOf('month').day();
    if (weekday === 0) {
        return 0;
    }

    return 7 - weekday;
}

export function createMonthDays(month: number): MonthDay[] {
    const curr = dayjs().utc().set('month', month);
    const prev = curr.startOf('month').subtract(daysToPrevMonday(curr), 'days');
    const next = curr.endOf('month').add(daysToNextSunday(curr), 'days');

    const isPrevSameAsCurrent = prev.isSame(curr, 'month');
    const isNextSameAsCurrent = next.isSame(curr, 'month');

    const prevMonth = !isPrevSameAsCurrent
        ? newMonth({ beginning: prev })
        : [];

    const nextMonth = !isNextSameAsCurrent
        ? newMonth({ end: next })
        : [];

    return [
        ...prevMonth,
        ...newMonth({ beginning: curr.startOf('month') }),
        ...nextMonth,
    ];
}
