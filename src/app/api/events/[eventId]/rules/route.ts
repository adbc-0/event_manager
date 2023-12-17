import { NextResponse } from "next/server";

import { hashId } from "~/services/hashId";
import { postgres } from "~/services/postgres";

type RouteParams = {
    eventId: string;
};

type RequestParams = {
    params: RouteParams;
};

type EventRules = {
    id: number;
    name: string;
    rule: string;
    user_id: number;
};

export type RequestResponse = EventRules[];

export async function GET(_: Request, { params }: RequestParams) {
    const [eventId, decodingError] = hashId.decode(params.eventId);
    if (decodingError) {
        return NextResponse.json(
            { message: "Invalid event id format" },
            { status: 404 },
        );
    }

    const rules = await postgres<EventRules[]>`
        SELECT id, name, rule, user_id
        FROM event.availability_rules
        WHERE event_id = ${eventId};
    `;
    return NextResponse.json(rules);
}
