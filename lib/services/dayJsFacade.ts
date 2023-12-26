import dayjs, { extend } from "dayjs";
import utc from "dayjs/plugin/utc";
import customParseFormat from "dayjs/plugin/customParseFormat";

import { range } from "../utils";
import { MILLISECONDS_IN_WEEK } from "~/constants";
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
          end: dayjs.Dayjs;
      }
    | {
          beginning: dayjs.Dayjs;
          end: null;
      };

function newDate(day: number, month: number, year: number): MonthDay {
    return { day, month, year, key: `${day}-${month}-${year}` };
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

function daysToPrevMonday(date: dayjs.Dayjs) {
    const weekday = date.startOf("month").day();
    if (weekday === 0) {
        return 6;
    }

    return weekday - 1;
}

function daysToNextSunday(date: dayjs.Dayjs) {
    const weekday = date.endOf("month").day();
    if (weekday === 0) {
        return 0;
    }

    return 7 - weekday;
}

export function getCurrentDate(o: DateOptions = {}) {
    return transformDayJsToCurrentDate(dayjs().utc(o.utc));
}

export function transformCurrentDateToDaysJs({
    day,
    month,
    year,
}: CurrentDate): dayjs.Dayjs {
    return dayjs(`${year}-${month + 1}-${day}`);
}

export function transformDayJsToCurrentDate(
    dayjsObject: dayjs.Dayjs,
): CurrentDate {
    return {
        day: dayjsObject.date(),
        month: dayjsObject.month(),
        year: dayjsObject.year(),
    };
}

export function eventDateToDate([month, year]: readonly [string, string]) {
    return dayjs(`${year}-${parseInt(month) + 1}-${1}`);
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

export function getInitialWeek(
    interval: string,
    ruleCreationDate: Date,
    startMonthDate: dayjs.Dayjs,
) {
    const intervalInt = Number.parseInt(interval);
    const parsedCreationDate = dayjs(ruleCreationDate).utc(true);
    const weeksSinceRuleCreationToStartDate = Math.trunc(
        startMonthDate.diff(parsedCreationDate) / MILLISECONDS_IN_WEEK + 1,
    );
    if (weeksSinceRuleCreationToStartDate < 0) {
        return startMonthDate;
    }
    const nextOccurence =
        intervalInt - (weeksSinceRuleCreationToStartDate % intervalInt);
    return startMonthDate.add(nextOccurence - 1, "weeks");
}

export function newDateFromNativeDate(date: Date, o: DateOptions = {}) {
    return dayjs(date).utc(o.utc);
}
