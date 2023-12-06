import { NextResponse } from "next/server";

import { hashId } from "~/services/hashId";
import { postgres } from "~/services/postgres";

type RouteParams = {
    id: string; // event_id
};

type RequestParams = {
    params: RouteParams;
};

type EventRules = {
    id: number;
    rule: string;
    user_id: number;
};

export type RequestResponse = EventRules[];

export async function GET(_: Request, { params }: RequestParams) {
    const [eventId, decodingError] = hashId.decode(params.id);
    if (decodingError) {
        return NextResponse.json(
            { message: "Invalid event id format" },
            { status: 404 },
        );
    }

    const rules = await postgres<EventRules[]>`
        SELECT id, rule, user_id
        FROM event.availability_rules
        WHERE event_id = ${eventId};
    `;
    return NextResponse.json(rules);
}
