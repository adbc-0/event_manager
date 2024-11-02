import { NextResponse } from "next/server";

import { hashId } from "~/services/hashId";
import { postgres } from "~/services/postgres";
import { ID } from "~/typescript";

type RouteParams = {
    eventId: string;
};

type RequestParams = {
    params: Promise<RouteParams>;
};

export type EventUser = {
    id: ID;
    username: string;
};

export type RequestResponse = EventUser[];

export const dynamic = 'force-static';
export async function GET(_: Request, props: RequestParams) {
    const params = await props.params;
    const [eventId, decodingError] = hashId.decode(params.eventId);
    if (decodingError) {
        return NextResponse.json(
            { message: "Invalid event id format" },
            { status: 404 },
        );
    }

    const users = await postgres<EventUser[]>`
        SELECT id, username FROM event.events_users WHERE event_id = ${eventId};
    `;

    if (!users.length) {
        return NextResponse.json(
            { message: "No users found for such event" },
            { status: 404 },
        );
    }

    return NextResponse.json(users);
}
