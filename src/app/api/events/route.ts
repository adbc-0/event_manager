import { NextResponse } from "next/server";

export async function GET() {
    const response = await new Promise((resolve) => {
        resolve({ month_name: 'January' });
    });

    return NextResponse.json(response);
}
