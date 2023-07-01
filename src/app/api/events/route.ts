import { NextResponse } from "next/server";

import { hashId } from "~/services/hashId";
import { postgres } from "~/services/postgres";

type EventsResponse = {
    id: number;
    name: string;
    owner_id: number;
};

// ToDo: @authenticated
export async function GET() {
    const rows = await postgres<EventsResponse[]>`
        SELECT id, name, owner_id FROM event.events;
    `;

    const decoratedRows = rows.map((row) => ({
        ...row,
        id: hashId.encode(row.id.toString()),
    }));

    return NextResponse.json(decoratedRows);
}
