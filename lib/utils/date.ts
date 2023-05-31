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
    year: number;
}

function newDate(day: number, month: number, year: number): MonthDay {
    return { day, month, year, key: `${day}-${month}-${year}` };
}

function newMonth({ beginning, end }: AtLeastOnePropertyOf<NewMonth>) {
    const fromDate = beginning ?? end!.startOf('month');
    const toDate = end ?? beginning!.endOf('month');
    const month = fromDate.month();
    const year = fromDate.year();
    return range(
        fromDate.date(),
        toDate.diff(fromDate, 'days') + 1,
        (i) => newDate(i, month, year)
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

export function getCurrentDay() {
    return dayjs().utc().date();
}

export function getCurrentMonth() {
    return dayjs().utc().month();
}

export function getCurrentYear() {
    return dayjs().utc().year();
}

export function getCurrentDate() {
    const currentDate = dayjs().utc();
    return {
        day: currentDate.date(),
        month: currentDate.month(),
        year: currentDate.year(),
    };
}

export function createMonthDays(month: number, year: number): MonthDay[] {
    const curr = dayjs()
        .utc()
        .set('month', month)
        .set('year', year);
    const prev = curr
        .startOf('month')
        .subtract(daysToPrevMonday(curr), 'days');
    const next = curr
        .endOf('month')
        .add(daysToNextSunday(curr), 'days');

    const isMondayFirstMonthDay = prev.isSame(curr, 'month');
    const isSundayLastMonthDay = next.isSame(curr, 'month');

    const prevMonth = !isMondayFirstMonthDay
        ? newMonth({ beginning: prev })
        : [];

    const nextMonth = !isSundayLastMonthDay
        ? newMonth({ end: next })
        : [];

    return [
        ...prevMonth,
        ...newMonth({ beginning: curr.startOf('month') }),
        ...nextMonth,
    ];
}
