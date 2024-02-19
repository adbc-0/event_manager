import { NextResponse } from "next/server";

import { hashId } from "~/services/hashId";
import { postgres } from "~/services/postgres";
import { parseRule } from "~/utils/eventUtils";
import { isNil } from "~/utils/index";
import { EditedRuleSchema, parsedRuleSchema } from "~/schemas";
import { ID } from "~/typescript";

// ToDo: Cleanup duplicate types from HERE, src/app/events/[id]/EventCalendar/EditCyclicEvent.tsx and src/app/api/events/[eventId]/rules/route.ts

type RouteParams = {
    eventId: string;
    ruleId: string;
};

type RequestParams = {
    params: RouteParams;
};

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
    const newRuleData = EditedRuleSchema.parse(body);

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
    const { eventId: encodedEventId, ruleId } = params;
    const [eventId, decodingError] = hashId.decode(encodedEventId);
    if (decodingError) {
        return NextResponse.json(
            { message: "Invalid event id format" },
            { status: 404 },
        );
    }
    if (!ruleId) {
        return NextResponse.json(
            { message: "Missing parameter" },
            { status: 404 },
        );
    }

    const [{ id: existingRuleId }] = await postgres<{ id: ID }[]>`
        SELECT id
        FROM event.availability_rules
        WHERE event_id = ${eventId}
    `;
    if (!existingRuleId) {
        return NextResponse.json(
            { message: "Rule not found" },
            { status: 404 },
        );
    }

    await postgres`
        DELETE FROM event.availability_rules
        WHERE id = ${params.ruleId};
    `;

    return NextResponse.json({}, { status: 201 });
}
