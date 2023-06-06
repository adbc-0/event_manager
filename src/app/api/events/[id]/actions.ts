"use server";

import { revalidatePath } from "next/cache";

export async function changeAvailability(
    eventId: string,
    day: Record<string, string>,
) {
    // make change to the db
    await new Promise((r) => r(day));
    revalidatePath(`/calendar/${eventId}`);
}
