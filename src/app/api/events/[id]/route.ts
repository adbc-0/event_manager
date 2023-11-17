import { NextResponse } from "next/server";

import { AvailabilityEnumValues } from "~/constants";
import { groupBy } from "~/utils/index";
import { hashId } from "~/services/hashId";
import { postgres } from "~/services/postgres";
import {
    decodeEventParamDate,
    validateEventParamDate,
} from "~/utils/eventUtils";
import { AvailabilityChoices, EventResponse } from "~/typescript";

type Event = {
    event_id: string;
    name: string;
};

type GroupedChoices = Record<string, AvailabilityChoices>;

type MonthsChoices = {
    choice: AvailabilityEnumValues;
    day: number;
    month_id: number;
    month: number;
    year: number;
    username: string;
};

type RouteParams = {
    id: string; // event_id
};

type RequestParams = {
    params: RouteParams;
};

const groupUserChoices = (prev: GroupedChoices, curr: MonthsChoices) => {
    const { choice, day, username: user_id } = curr;

    if (!prev[user_id]) {
        prev[user_id] = {
            available: [],
            maybe_available: [],
            unavailable: [],
        };
    }

    prev[user_id][choice].push(day);

    return prev;
};

export async function GET(request: Request, { params }: RequestParams) {
    const { searchParams } = new URL(request.url);
    const [eventId, decodingError] = hashId.decode(params.id);

    const date = searchParams.get("date");
    const isValid = date ? validateEventParamDate(date) : null;

    if (decodingError) {
        return NextResponse.json(
            { message: "Invalid event id format" },
            { status: 404 },
        );
    }

    if (isValid === false) {
        return NextResponse.json(
            { message: "Wrong event date param format" },
            { status: 400 },
        );
    }

    const [event] = await postgres<Event[]>`
        SELECT
            e.id AS event_id,
            e.name
        FROM event.events AS e
        WHERE e.id = ${eventId};
    `;

    if (!event) {
        return NextResponse.json(
            { message: "Event not found" },
            { status: 404 },
        );
    }

    const filterByDate = (rawDateParam: string) => {
        const [month, year] = decodeEventParamDate(rawDateParam);
        return postgres`
            AND m.year = ${year}
            AND m.month = ${month};
        `;
    };

    const eventMonths = await postgres<MonthsChoices[]>`
        SELECT
            m.id AS month_id,
            m.month,
            m.year,
            c.day,
            c.choice
        FROM event.events_months AS m
        JOIN event.availability_choices AS c ON c.event_month_id=m.id
        WHERE
            m.event_id=${event.event_id}
            ${date ? filterByDate(date) : postgres``}
    `;

    const groupedMonths = groupBy(eventMonths, (v) => `${v.month}-${v.year}`);
    const groupedChoices = Object.entries(groupedMonths).map(([date, m]) => ({
        time: date,
        usersChoices: m.reduce(groupUserChoices, {} as GroupedChoices),
    }));

    const generateNilChoices = date && !groupedChoices.length;
    if (generateNilChoices) {
        const nilChoicesResponse: EventResponse = {
            name: event.name,
            months: [{ time: date, usersChoices: {} }],
        };

        return NextResponse.json(nilChoicesResponse);
    }

    const response: EventResponse = {
        name: event.name,
        months: groupedChoices,
    };

    return NextResponse.json(response);
}
