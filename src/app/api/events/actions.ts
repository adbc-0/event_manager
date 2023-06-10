"use server";

import { revalidatePath } from "next/cache";

export async function DeleteEvent(
    eventId: string,
    day: Record<string, string>,
) {
    // make change to the db
    await new Promise((r) => r(day));
    revalidatePath(`/calendar/${eventId}`);
}

export async function PostEvent(formData: FormData) {
    const newEventName = formData.get("event_name");
    console.log(newEventName);
    revalidatePath(`/events`);
}

export async function PutEvent(eventId: string, day: Record<string, string>) {
    // make change to the db
    await new Promise((r) => r(day));
    revalidatePath(`/events`);
}
