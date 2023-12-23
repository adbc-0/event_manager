"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { hashId } from "~/services/hashId";
import { postgres } from "~/services/postgres";
import { createMonth } from "../../queries";
import { ID } from "~/typescript";

const changeAvailabilitySchema = z.object({
    choices: z.record(z.string(), z.string()),
    date: z.object({
        day: z.number(),
        month: z.number(),
        year: z.number(),
    }),
    eventId: z.string(),
    userId: z.number().optional(),
});

type ChangeAvailabilitySchema = z.infer<typeof changeAvailabilitySchema>;

export async function ChangeAvailability(payload: ChangeAvailabilitySchema) {
    const {
        choices,
        date,
        eventId: encodedEventId,
        userId,
    } = changeAvailabilitySchema.parse(payload);
    if (!userId) {
        throw new Error("unauthorized");
    }

    const [eventId, decodingError] = hashId.decode(encodedEventId);
    if (decodingError) {
        throw new Error(decodingError);
    }

    const [maybeMonth] = await postgres<{ id: ID }[]>`
        SELECT id
        FROM event.events_months
        WHERE
            event_id=${eventId}
            AND year=${date.year}
            AND month=${date.month}
        ;
    `;

    const month = maybeMonth ? maybeMonth : await createMonth(date, eventId!);

    const newEvents = Object.entries(choices).map(([k, v]) => ({
        day: k,
        choice: v,
        event_month_id: month.id,
        user_id: userId,
    }));

    await postgres.begin(async (postgres) => {
        await postgres`
            DELETE FROM event.availability_choices
            WHERE
                event_month_id=${month.id}
                AND user_id=${userId};
        `;

        await postgres`
            INSERT INTO event.availability_choices ${postgres(
                newEvents,
                "day",
                "choice",
                "event_month_id",
                "user_id",
            )}
        `;
    });

    revalidatePath(`/calendar/${eventId}`);
}
