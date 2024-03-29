import dayjs, { extend } from "dayjs";
import utc from "dayjs/plugin/utc";
import customParseFormat from "dayjs/plugin/customParseFormat";

import { range } from "~/std";
import { DAYS_IN_WEEK, MILLISECONDS_IN_WEEK, WeekdaysList } from "~/constants";
import { CurrentDate } from "~/typescript";

extend(utc);
extend(customParseFormat);

export type MonthDay = {
    key: string;
    day: number;
    month: number;
    year: number;
};

export type DayJs = dayjs.Dayjs;

type DateOptions = {
    utc?: boolean;
};

type NewMonth =
    | {
          beginning: null;
          end: DayJs;
      }
    | {
          beginning: DayJs;
          end: null;
      };

function newDate(day: number, month: number, year: number): MonthDay {
    return { day, month, year, key: `${day}-${month}-${year}` };
}

export function MonthDayToDate({ day, month, year }: MonthDay) {
    return dayjs(`${year}-${month + 1}-${day}`);
}

function newMonth({ beginning, end }: NewMonth) {
    const fromDate = beginning ?? end.startOf("month");
    const toDate = end ?? beginning.endOf("month");
    const month = fromDate.month();
    const year = fromDate.year();
    return range(fromDate.date(), toDate.diff(fromDate, "days") + 1, (i) =>
        newDate(i, month, year),
    );
}

function daysToPrevMonday(date: DayJs) {
    const weekday = date.startOf("month").day();
    if (weekday === 0) {
        return 6;
    }

    return weekday - 1;
}

function daysToNextSunday(date: DayJs) {
    const weekday = date.endOf("month").day();
    if (weekday === 0) {
        return 0;
    }

    return 7 - weekday;
}

function transformCurrentDateToDaysJs({
    day,
    month,
    year,
}: CurrentDate): DayJs {
    return dayjs(`${year}-${month + 1}-${day}`);
}

function transformDayJsToCurrentDate(dayjsObject: DayJs): CurrentDate {
    return {
        day: dayjsObject.date(),
        month: dayjsObject.month(),
        year: dayjsObject.year(),
    };
}

export function getCurrentDate(o: DateOptions = {}) {
    return transformDayJsToCurrentDate(dayjs().utc(o.utc));
}

export function getNextMonthDate(currentDate: CurrentDate): CurrentDate {
    const nextMonthDate = transformCurrentDateToDaysJs(currentDate)
        .startOf("month")
        .add(1, "month");
    return transformDayJsToCurrentDate(nextMonthDate);
}

export function getPrevMonthDate(currentDate: CurrentDate): CurrentDate {
    const nextMonthDate = transformCurrentDateToDaysJs(currentDate)
        .startOf("month")
        .subtract(1, "month");
    return transformDayJsToCurrentDate(nextMonthDate);
}

export function getLastDayOfMonth(currentDate: CurrentDate): number {
    return transformCurrentDateToDaysJs(currentDate).endOf("month").date();
}

export function createMonthDays({ month, year }: CurrentDate): MonthDay[] {
    const curr = dayjs().set("month", month).set("year", year);
    const prev = curr.startOf("month").subtract(daysToPrevMonday(curr), "days");
    const next = curr.endOf("month").add(daysToNextSunday(curr), "days");

    const isMondayFirstMonthDay = prev.isSame(curr, "month");
    const isSundayLastMonthDay = next.isSame(curr, "month");

    const prevMonth = !isMondayFirstMonthDay
        ? newMonth({ beginning: prev, end: null })
        : [];

    const nextMonth = !isSundayLastMonthDay
        ? newMonth({ beginning: null, end: next })
        : [];

    return [
        ...prevMonth,
        ...newMonth({ beginning: curr.startOf("month"), end: null }),
        ...nextMonth,
    ];
}

export function convertStringToDate(dateString: string) {
    const convertedDate = dayjs(dateString, "DD-MM-YYYY").utc(true);
    if (!convertedDate.isValid()) {
        throw new Error("Date Error: could not convert string to date");
    }
    return convertedDate;
}

// What is difference between this and getNextOccurences?
function findDayInWeek(fromDate: DayJs, searchedWeekDay: number) {
    const startingDateDay = fromDate.day();
    if (searchedWeekDay === startingDateDay) {
        return fromDate;
    }
    if (searchedWeekDay > startingDateDay) {
        const daysDiff = searchedWeekDay - startingDateDay;
        return fromDate.add(daysDiff, "days");
    }
    if (searchedWeekDay < startingDateDay) {
        const remainingWeekDays = DAYS_IN_WEEK - startingDateDay;
        const daysDiff = remainingWeekDays + searchedWeekDay;
        return fromDate.add(daysDiff, "days");
    }
    throw new Error("MissingCondition Error");
}

export function findInitialOccurenceForDate(
    searchBeginning: DayJs,
    ruleCreationNativeDate: Date,
    interval: number,
) {
    return function (searchedInitialDay: number) {
        const ruleCreationDate = dayjs(ruleCreationNativeDate);
        const shiftedSearchedDate = findDayInWeek(
            searchBeginning,
            searchedInitialDay,
        );
        const weeksSinceRuleCreationToStartDate = Math.floor(
            shiftedSearchedDate.diff(ruleCreationDate) / MILLISECONDS_IN_WEEK,
        );

        const weekOrder = weeksSinceRuleCreationToStartDate % interval;
        const weeksToFirstOccurence = weekOrder
            ? interval - weekOrder
            : weekOrder;

        return shiftedSearchedDate.add(weeksToFirstOccurence, "weeks");
    };
}

export function newDateFromNativeDate(date?: Date, o: DateOptions = {}) {
    return dayjs(date).utc(o.utc);
}

export function getCurrentDayOfWeek() {
    const currentDate = dayjs();
    return WeekdaysList[currentDate.day()];
}
