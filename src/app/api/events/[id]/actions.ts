"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { postgres } from "~/services/postgres";
import { getAnonymousUserId } from "../../genericQueries";

const changeAvailabilitySchema = z.object({
    choices: z.record(z.string(), z.string()),
    date: z.object({
        day: z.number(),
        month: z.number(),
        year: z.number(),
    }),
    eventId: z.string(),
    userName: z.string().optional(),
});

type ChangeAvailabilitySchema = z.infer<typeof changeAvailabilitySchema>;

// ToDo: @authenticated
export async function ChangeAvailability(payload: ChangeAvailabilitySchema) {
    const { choices, date, eventId, userName } =
        changeAvailabilitySchema.parse(payload);

    const authUser = null;

    const ownerId = authUser ? authUser : await getAnonymousUserId(userName);

    if (!ownerId) {
        // ToDo: create new anonymous user
        throw new Error("unauthorized");
    }

    const [{ id: monthId }] = await postgres<{ id: number }[]>`
        SELECT
            id
        FROM event.events_months
        WHERE
            event_id=${eventId}
            AND year=${date.year}
            AND month=${date.month}
        ;
    `;

    if (!monthId) {
        throw new Error("unknown month id");
    }

    const newEvents = Object.entries(choices).map(([k, v]) => ({
        day: k,
        choice: v,
        event_month_id: monthId,
        user_id: ownerId,
    }));

    await postgres.begin(async (postgres) => {
        await postgres`
            DELETE FROM event.availability_choices
            WHERE
                event_month_id=${monthId}
                AND user_id=${ownerId};
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
