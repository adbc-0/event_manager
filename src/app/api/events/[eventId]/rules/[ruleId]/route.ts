import { NextResponse } from "next/server";

import { hashId } from "~/services/hashId";
import { postgres } from "~/services/postgres";

type RouteParams = {
    eventId: string;
    ruleId: string;
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

export async function DELETE(_: Request, { params }: RequestParams) {
    const [eventId, decodingError] = hashId.decode(params.eventId);
    if (decodingError) {
        return NextResponse.json(
            { message: "Invalid event id format" },
            { status: 404 },
        );
    }

    await postgres`
        DELETE FROM event.availability_rules
        WHERE id = ${params.ruleId};
    `;

    const rules = await postgres<EventRules[]>`
        SELECT id, name, rule, user_id
        FROM event.availability_rules
        WHERE event_id = ${eventId};
    `;
    return NextResponse.json(rules);
}
