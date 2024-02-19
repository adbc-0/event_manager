import { NextResponse } from "next/server";

import { hashId } from "~/services/hashId";
import { postgres } from "~/services/postgres";
import { parseRule } from "~/utils/eventUtils";
import { NewRuleSchema, parsedRuleSchema } from "~/schemas";
import { AvailabilityEnumValues, FreqEnumValues, ID } from "~/typescript";

type RouteParams = {
    eventId: string;
};

type RequestParams = {
    params: RouteParams;
};

export type EventRule = {
    id: ID;
    name: string;
    rule: FreqEnumValues; // ToDo: Add constraint to db so not any string can be saved
    user_id: ID;
    choice: AvailabilityEnumValues;
};

export type RequestResponse = ReadonlyArray<EventRule>;

function ofUser(userId: string) {
    return postgres`AND user_id=${userId}`;
}

export async function GET(request: Request, { params }: RequestParams) {
    const { searchParams } = new URL(request.url);

    const [eventId, decodingError] = hashId.decode(params.eventId);
    if (decodingError) {
        return NextResponse.json(
            { message: "Invalid event id format" },
            { status: 404 },
        );
    }

    const userId = searchParams.get("userId");

    const rules = await postgres<EventRule[]>`
        SELECT id, name, rule, user_id, choice
        FROM event.availability_rules
        WHERE event_id = ${eventId}
            ${userId ? ofUser(userId) : postgres``};
    `;
    return NextResponse.json(rules);
}

export async function POST(req: Request, { params }: RequestParams) {
    const [eventId, decodingError] = hashId.decode(params.eventId);
    if (decodingError) {
        return NextResponse.json(
            { message: "Invalid event id format" },
            { status: 404 },
        );
    }

    const body = await req.json();
    const rule = NewRuleSchema.parse(body);

    const ruleObject = parseRule(rule.rule);
    parsedRuleSchema.parse(ruleObject);

    const addedRule = await postgres<Array<{ id: ID }>>`
        INSERT INTO event.availability_rules(name, choice, rule, start_date, user_id, event_id)
        VALUES(${rule.name}, ${rule.availabilityChoice}, ${rule.rule}, ${rule.startDate}, ${rule.userId}, ${eventId})
        RETURNING id;
    `;
    return NextResponse.json(addedRule);
}
