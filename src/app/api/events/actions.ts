"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";

import { postgres } from "~/services/postgres";
import { hashId } from "~/services/hashId";

// ToDo: @authenticated
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

const newEventSchema = z.object({
    event_name: z.string().trim().min(1).max(80),
});

type NewEventSchema = Partial<z.infer<typeof newEventSchema>>;

// ToDo: @authenticated
export async function AddEvent(newEvent: NewEventSchema) {
    const payload = newEventSchema.parse(newEvent);
    const onwerId = 1;

    const event = {
        name: payload.event_name,
        owner_id: onwerId,
    };

    await postgres`INSERT INTO event.events ${postgres(
        event,
        "name",
        "owner_id",
    )};`;

    revalidatePath(`/events`);
}
