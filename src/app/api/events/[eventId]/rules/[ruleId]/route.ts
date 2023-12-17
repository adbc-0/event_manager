import { NextResponse } from "next/server";
import { z } from "zod";

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

const Rule = z.object({
    name: z.string(),
    choice: z.string(),
    rule: z.string(),
    start_date: z.string(),
    user_id: z.string(),
});

export async function POST(req: Request, { params }: RequestParams) {
    const [eventId, decodingError] = hashId.decode(params.eventId);
    if (decodingError) {
        return NextResponse.json(
            { message: "Invalid event id format" },
            { status: 404 },
        );
    }
    // ToDo: can a parameter be missing in route or have wrong format??

    const body = await req.json();
    const rule = Rule.parse(body);

    const addedRule = await postgres`
        INSERT INTO (name, choice, rule, start_date, user_id, event_id)
        VALUES (${rule.name}, ${rule.choice}, ${rule.rule}, ${rule.start_date}, ${rule.user_id}, ${eventId})
        RETURNING id
    `;

    return NextResponse.json(addedRule);
}

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
