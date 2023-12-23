import { NextResponse } from "next/server";

import { hashId } from "~/services/hashId";
import { postgres } from "~/services/postgres";
import { validateEventParamDate } from "~/utils/eventUtils";
import { ID } from "~/typescript";

type RouteParams = {
    eventId: string;
};

type RequestParams = {
    params: RouteParams;
};

export type EventUser = {
    id: ID;
    username: string;
};

export type RequestResponse = EventUser[];

export async function GET(request: Request, { params }: RequestParams) {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");

    const [eventId, decodingError] = hashId.decode(params.eventId);
    if (decodingError) {
        return NextResponse.json(
            { message: "Invalid event id format" },
            { status: 404 },
        );
    }

    const isValid = date ? validateEventParamDate(date) : null;
    if (isValid === false) {
        return NextResponse.json(
            { message: "Wrong event date param format" },
            { status: 400 },
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
