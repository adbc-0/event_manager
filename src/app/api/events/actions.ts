"use server";

import { revalidatePath } from "next/cache";

import { postgres } from "~/services/postgres";
import { hashId } from "~/services/hashId";

// ToDo: @authenticated
// ToDo: @unused
// ToDo: Remove all anonymous users
export async function DeleteEvent(encodedEventId: string) {
    const [eventId, decodingError] = hashId.decode(encodedEventId);
    if (decodingError) {
        throw new Error(decodingError);
    }

    await postgres`
        DELETE FROM event.events WHERE id=${eventId};
    `;

    revalidatePath(`/calendar/${eventId}`);
}
