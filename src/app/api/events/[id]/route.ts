import { NextResponse } from "next/server";

import { AvailabilityEnumValues } from "~/constants";
import { postgres } from "~/services/postgres";
import {
    decodeEventParamDate,
    validateEventParamDate,
} from "~/utils/eventUtils";
import { HashId } from "~/typescript";

type Event = {
    event_id: HashId;
    name: string;
    owner_id: HashId;
};

type EventMonth = {
    month_id: number;
    month: number;
};

type Availability = {
    day: string;
    choice: AvailabilityEnumValues;
    user_id: HashId;
};

type RouteParams = {
    id: string; // event_id
};

type RequestParams = {
    params: RouteParams;
};

export async function GET(request: Request, { params }: RequestParams) {
    const { searchParams } = new URL(request.url);
    const owner_id = 1;

    // ToDo: Make it not required
    const date = searchParams.get("date");
    if (!date) {
        return NextResponse.json(
            { message: "Missing required param" },
            { status: 404 },
        );
    }

    try {
        validateEventParamDate(date);
    } catch {
        return NextResponse.json(
            { message: "Wrong event date param format" },
            { status: 400 },
        );
    }

    const [month, year] = decodeEventParamDate(date);

    const [event] = await postgres<Event[]>`
        SELECT
            e.id AS event_id,
            e.name,
            e.owner_id
        FROM event.events AS e
        WHERE
            e.id = ${params.id}
            AND e.owner_id = ${owner_id};
    `;

    if (!event) {
        return NextResponse.json(
            { message: "Event not found" },
            { status: 404 },
        );
    }

    const [eventMonth] = await postgres<EventMonth[]>`
        SELECT
            m.id AS month_id,
            m.month
        FROM event.events_months AS m
        WHERE
            m.event_id=${event.event_id}
            AND m.year = ${year}
            AND m.month = ${month};
    `;

    if (!eventMonth) {
        const composedResponse = {
            eventName: event.name,
            time: date,
            users: {},
        };

        return NextResponse.json([composedResponse]);
    }

    const availabilityRows = await postgres<Availability[]>`
        SELECT
            c.day,
            c.choice,
            c.user_id
        FROM event.availability_choices as c
        WHERE c.event_month_id = ${eventMonth.month_id};
    `;

    type GroupedChoices = Record<
        string,
        Record<AvailabilityEnumValues, string[]>
    >;

    const groupedChoices = availabilityRows.reduce((prev, curr) => {
        const { choice, day, user_id } = curr;

        if (!prev[user_id]) {
            prev[user_id] = {
                available: [],
                maybe_available: [],
                unavailable: [],
            };
        }

        prev[user_id][choice].push(day);

        return prev;
    }, {} as GroupedChoices);

    const composedResponse = {
        eventName: event.name,
        time: date,
        users: groupedChoices,
    };

    return NextResponse.json([composedResponse]);
}
