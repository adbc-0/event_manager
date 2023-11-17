import { NextResponse } from "next/server";

import { hashId } from "~/services/hashId";
import { validateEventParamDate } from "~/utils/eventUtils";


type RouteParams = {
    id: string; // event_id
};

type RequestParams = {
    params: RouteParams;
};

export async function GET(request: Request, { params }: RequestParams) {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");

    const [eventId, decodingError] = hashId.decode(params.id);
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

    // ToDo: Query Users

    return NextResponse.json({ id: eventId });
}
