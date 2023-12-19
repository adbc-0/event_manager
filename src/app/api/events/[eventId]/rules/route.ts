import { NextResponse } from "next/server";
import { z } from "zod";

import { AvailabilityEnum } from "~/constants";
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

const RuleSchema = z.object({
    name: z.string().trim().min(1),
    availabilityChoice: z.nativeEnum(AvailabilityEnum),
    rule: z.string().trim(),
    startDate: z.string().pipe(z.coerce.date()),
    userId: z.number().min(1),
});

export async function POST(req: Request, { params }: RequestParams) {
    const [eventId, decodingError] = hashId.decode(params.eventId);
    if (decodingError) {
        return NextResponse.json(
            { message: "Invalid event id format" },
            { status: 404 },
        );
    }
    // ToDo: Can a parameter be missing in route or have wrong format??
    // ToDo: Validate rule

    const body = await req.json();
    const rule = RuleSchema.parse(body);

    const addedRule = await postgres`
        INSERT INTO event.availability_rules(name, choice, rule, start_date, user_id, event_id)
        VALUES(${rule.name}, ${rule.availabilityChoice}, ${rule.rule}, ${rule.startDate}, ${rule.userId}, ${eventId})
        RETURNING id;
    `;
    return NextResponse.json(addedRule);
}