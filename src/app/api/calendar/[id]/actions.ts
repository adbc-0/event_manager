"use server";

import { revalidatePath } from "next/cache";

export async function changeAvailability(eventId: string) {
    await new Promise((r) => r({}));
    revalidatePath(`/calendar/${eventId}`);
}
