import { NextResponse } from "next/server";

type RouteParams = {
    id: string;
}

type RequestParams = {
    params: RouteParams;
}

export async function PUT(request: Request, { params }: RequestParams) {
    const response = await new Promise((resolve) => {
        console.log('resolve PUT for:', params.id);
        resolve([]);
    });

    return NextResponse.json(response);
}
