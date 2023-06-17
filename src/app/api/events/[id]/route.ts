import { NextResponse } from "next/server";

import { postgres } from "~/services/postgres";
import {
    decodeEventParamDate,
    validateEventParamDate,
} from "~/utils/eventUtils";
import { groupBy } from "~/utils/utils";
import { HashId } from "../../../../../typescript";

type Event = {
    event_id: HashId;
    name: string;
    owner_id: HashId;
    month_id: number;
    month: number;
};

// ToDo: Export event related code to event related files
type Choice = "available" | "unavailable" | "maybe_available";

type Availability = {
    day: string;
    choice: Choice;
    user_id: HashId;
};

type RouteParams = {
    id: string;
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
            { message: "Wront event date param format" },
            { status: 400 },
        );
    }

    const [month, year] = decodeEventParamDate(date);

    const [event] = await postgres<Event[]>`
        SELECT
            e.id AS event_id,
            e.name,
            e.owner_id,
            m.id AS month_id,
            m.month
        FROM event.events AS e
        JOIN event.events_months AS m ON e.id=m.event_id
        WHERE
            e.id = ${params.id}
            AND e.owner_id = ${owner_id}
            AND m.year = ${year}
            AND m.month = ${month};
    `;

    if (!event) {
        return NextResponse.json(
            { message: "Event not found" },
            { status: 404 },
        );
    }

    const availabilityRows = await postgres<Availability[]>`
        SELECT
            c.day,
            c.choice,
            c.user_id
        FROM event.availability_choices as c
        WHERE c.event_month_id = ${event.month_id};
    `;

    type GroupedAvailability = {
        [k: string]: {
            [k in Choice]: Availability[];
        };
    };

    // ToDo: Tidy Up
    const userGrouped = groupBy(availabilityRows, (predicate) =>
        predicate.user_id.toString(),
    );
    const availabilityGrouped = Object.entries(userGrouped).reduce(
        (prev, [k, v]) => {
            prev[k] = groupBy(v, (predicate) => predicate.choice) as Record<
                Choice,
                Availability[]
            >;
            return prev;
        },
        {} as GroupedAvailability,
    );

    const nonEmptyAvailabilities = Object.keys(availabilityGrouped).reduce(
        (prev, k) => {
            const userData = prev[k];
            console.log(userData, k, availabilityGrouped);
            if (!("available" in userData)) {
                prev[k].available = [];
            }
            if (!("unavailable" in userData)) {
                prev[k].unavailable = [];
            }
            if (!("maybe_available" in userData)) {
                prev[k].maybe_available = [];
            }

            return prev;
        },
        availabilityGrouped,
    );

    // can this be written recurseively?
    const cleanUpGroupedChoices = (choices: GroupedAvailability) => {
        const clone = structuredClone(choices);
        Object.keys(clone).forEach((c) => {
            Object.entries(clone[c]).forEach(([k, v]) => {
                clone[c][k] = v.map(({ day }) => day);
            });
        });
        return clone;
    };

    const r = cleanUpGroupedChoices(nonEmptyAvailabilities);

    const composedResponse = {
        eventName: event.name,
        time: date,
        users: r,
    };

    return NextResponse.json(composedResponse);
}
