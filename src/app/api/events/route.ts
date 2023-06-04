import { NextResponse } from "next/server";

export async function GET() {
    const response = await new Promise((resolve) => {
        resolve([
            { id: 1, name: 'DnD' },
            { id: 2, name: 'Divinity' },
        ]);
    });

    return NextResponse.json(response);
}
