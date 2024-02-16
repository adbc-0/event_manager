import { NextResponse } from "next/server";
import { z } from "zod";

import { hashId } from "~/services/hashId";
import { postgres } from "~/services/postgres";
import { AvailabilityEnum } from "~/constants";
import { parseRule } from "~/utils/eventUtils";
import { ID } from "~/typescript";
import { isNil } from "~/utils/index";

// ToDo: Cleanup duplicate types from HERE, src/app/events/[id]/EventCalendar/EditCyclicEvent.tsx and src/app/api/events/[eventId]/rules/route.ts

type RouteParams = {
    eventId: string;
    ruleId: string;
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

const RuleSchema = z.object({
    name: z.string().trim().min(1).max(19),
    availabilityChoice: z.nativeEnum(AvailabilityEnum),
    rule: z.string().trim(),
    userId: z.number().min(1),
});

const parsedRuleSchema = z.object({
    FREQ: z.string().optional(),
    INTERVAL: z.string().optional(),
    BYDAY: z.string().optional(),
});

export async function PUT(req: Request, { params }: RequestParams) {
    const [, decodingError] = hashId.decode(params.eventId);
    if (decodingError) {
        return NextResponse.json(
            { message: "Invalid event id format" },
            { status: 404 },
        );
    }

    const ruleId = Number.parseInt(params.ruleId);
    if (isNil(ruleId) || isNaN(ruleId)) {
        return NextResponse.json(
            { message: "Invalid rule id" },
            { status: 404 },
        );
    }

    const body = await req.json();
    const newRuleData = RuleSchema.parse(body);

    const ruleObject = parseRule(newRuleData.rule);
    parsedRuleSchema.parse(ruleObject);

    const rule = await postgres`
        SELECT id
        FROM event.availability_rules
        WHERE id = ${ruleId} AND user_id = ${newRuleData.userId}
    `;
    if (!rule) {
        return NextResponse.json(
            { message: "Rule not found" },
            { status: 404 },
        );
    }

    const updatedRule = await postgres`
        UPDATE event.availability_rules
        SET name = ${newRuleData.name}, choice = ${newRuleData.availabilityChoice}, rule = ${newRuleData.rule}
        WHERE id = ${ruleId}
        RETURNING id;
    `;

    return NextResponse.json(updatedRule);
}

// ToDo: Only user should be able to remove his own rule
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
