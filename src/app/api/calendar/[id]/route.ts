import { NextResponse } from "next/server";

// duplication src/app/calendar/[id]/page.tsx
type RouteParams = {
    id: string;
}

type RequestParams = {
    params: RouteParams;
}

// export async function GET(request: Request, { params }: RequestParams) {
//     const response = await new Promise((resolve) => {
//         console.log('resolve GET for:', params.id);
//         resolve([]);
//     });

//     return NextResponse.json(response);
// }

export async function PUT(request: Request, { params }: RequestParams) {
    const response = await new Promise((resolve) => {
        console.log('resolve PUT for:', params.id);
        resolve([]);
    });

    return NextResponse.json(response);
}
