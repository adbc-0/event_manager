import { NextResponse } from "next/server";

type RouteParams = {
    id: string;
}

type RequestParams = {
    params: RouteParams;
}

export async function GET(request: Request, { params }: RequestParams) {
    const { searchParams } = new URL(request.url);

    // {
    //     eventName: 'DnD',
    //     users: {
    //         orzel: { available: [1], notAvailable: [2], maybeAvailable: [3] },
    //         bidon: { available: [1], notAvailable: [3], maybeAvailable: [] }
    //     },
    // };

    if (searchParams.toString() === 'date=5-2023') {
        return NextResponse.json([{"eventName":"DnD","time":"2023-06-04T12:46:17.599Z","users":{}}]);
    } else if (searchParams.toString() === 'date=6-2023') {
        return NextResponse.json([{"eventName":"DnD","time":"2023-07-04T12:46:17.599Z","users":{}}]);
    } else if (searchParams.toString() === 'date=4-2023') {
        return NextResponse.json([{"eventName":"DnD","time":"2023-05-04T12:46:17.599Z","users":{}}]);
    } else {
        return NextResponse.json([{"eventName":"DnD","time":"2023-06-04T12:46:17.599Z","users":{}}]);
    }
}
