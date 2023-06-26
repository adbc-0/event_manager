"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";

import { postgres } from "~/services/postgres";
import { hashIds } from "~/services/hashId";

// ToDo: @authenticated
export async function DeleteEvent(eventId: string) {
    const trueEventId = hashIds.decode(eventId).toString();
    await postgres`
        DELETE FROM event.events WHERE id=${trueEventId};
    `;
    revalidatePath(`/calendar/${trueEventId}`);
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
