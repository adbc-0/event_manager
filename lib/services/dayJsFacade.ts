import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

import { range } from "../utils";
import { CurrentDate } from "~/typescript";

// eslint-disable-next-line import/no-named-as-default-member
dayjs.extend(utc);

export type MonthDay = {
    key: string;
    day: number;
    month: number;
    year: number;
};

function newDate(day: number, month: number, year: number): MonthDay {
    return { day, month, year, key: `${day}-${month}-${year}` };
}

type NewMonth =
    | {
          beginning: null;
          end: dayjs.Dayjs;
      }
    | {
          beginning: dayjs.Dayjs;
          end: null;
      };

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
        return 0;
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

export function getCurrentDate(): CurrentDate {
    return transformDayJsToCurrentDate(dayjs().utc());
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

// export function transformISO_8601ToCurrentDate(iso: string): CurrentDate {
//     const date = dayjs(iso);
//     return {
//         day: date.date(),
//         month: date.month(),
//         year: date.year(),
//     };
// }

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
    // ToDo: Adding utc causes problems (why? does it diff time to utc)
    return transformCurrentDateToDaysJs(currentDate).endOf("month").date();
}

export function createMonthDays({ month, year }: CurrentDate): MonthDay[] {
    const curr = dayjs().utc().set("month", month).set("year", year);
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
