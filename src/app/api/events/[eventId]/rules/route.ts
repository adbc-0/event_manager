import { NextResponse } from "next/server";
import { z } from "zod";

import { AvailabilityEnum } from "~/constants";
import { hashId } from "~/services/hashId";
import { postgres } from "~/services/postgres";
import { parseRule } from "~/utils/eventUtils";
import { ID } from "~/typescript";

type RouteParams = {
    eventId: string;
};

type RequestParams = {
    params: RouteParams;
};

type EventRules = {
    id: ID;
    name: string;
    rule: string;
    user_id: ID;
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
    startDate: z.string().datetime().pipe(z.coerce.date()),
    userId: z.number().min(1),
});

const parsedRuleSchema = z.object({
    FREQ: z.string().optional(),
    INTERVAL: z.string().optional(),
    BYDAY: z.string().optional(),
});

export async function POST(req: Request, { params }: RequestParams) {
    const [eventId, decodingError] = hashId.decode(params.eventId);
    if (decodingError) {
        return NextResponse.json(
            { message: "Invalid event id format" },
            { status: 404 },
        );
    }

    const body = await req.json();
    const rule = RuleSchema.parse(body);

    const ruleObject = parseRule(rule.rule);
    parsedRuleSchema.parse(ruleObject);

    const addedRule = await postgres<Array<{ id: ID }>>`
        INSERT INTO event.availability_rules(name, choice, rule, start_date, user_id, event_id)
        VALUES(${rule.name}, ${rule.availabilityChoice}, ${rule.rule}, ${rule.startDate}, ${rule.userId}, ${eventId})
        RETURNING id;
    `;
    return NextResponse.json(addedRule);
}
