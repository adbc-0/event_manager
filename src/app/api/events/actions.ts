"use server";

// ToDo: Add HashIds -> npm i hashids

import { z } from "zod";
import { revalidatePath } from "next/cache";

import { postgres } from "~/services/postgres";

export async function DeleteEvent(eventId: string) {
    await postgres`
        DELETE FROM event.events WHERE id=${eventId};
    `;
    revalidatePath(`/calendar/${eventId}`);
}

const newEventSchema = z.object({
    owner_id: z.number(),
    event_name: z.string().trim().min(1).max(80),
});

type NewEventSchema = Partial<z.infer<typeof newEventSchema>>;

export async function addEvent(newEvent: NewEventSchema) {
    const payload = newEventSchema.parse(newEvent);

    await postgres`
        INSERT INTO event.events (name, owner_id)
        VALUES (${payload.event_name}, ${payload.owner_id});
    `;

    revalidatePath(`/events`);
}
