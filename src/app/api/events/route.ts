import { NextResponse } from "next/server";

import { postgres } from "~/services/postgres";

type EventsResponse = {
    id: number;
    name: string;
    owner_id: number;
};

export async function GET() {
    const rows = await postgres<EventsResponse[]>`
        SELECT id, name, owner_id FROM event.events;
    `;

    return NextResponse.json(rows);
}
