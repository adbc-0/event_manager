"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { hashId } from "~/services/hashId";
import { postgres } from "~/services/postgres";
import {
    createAnynomousUser,
    createMonth,
    getAnonymousUserId,
} from "../../queries";

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
    const {
        choices,
        date,
        eventId: encodedEventId,
        userName,
    } = changeAvailabilitySchema.parse(payload);

    const [eventId, decodingError] = hashId.decode(encodedEventId);
    if (decodingError) {
        throw new Error(decodingError);
    }

    const authUser = null;
    const maybeExistingUserId = authUser
        ? authUser
        : await getAnonymousUserId(userName);
    const shouldCreateAnonymousUser =
        !maybeExistingUserId && !userName && !authUser;
    const maybeUserId = maybeExistingUserId
        ? maybeExistingUserId
        : shouldCreateAnonymousUser
        ? // ToDo: non null assertion
          await createAnynomousUser(userName!)
        : null;

    if (!maybeUserId) {
        throw new Error("unauthorized");
    }

    const [maybeMonth] = await postgres<{ id: number }[]>`
        SELECT id
        FROM event.events_months
        WHERE
            event_id=${eventId}
            AND year=${date.year}
            AND month=${date.month}
        ;
    `;

    // ToDo: non null assertion
    const month = maybeMonth ? maybeMonth : await createMonth(date, eventId!);

    const newEvents = Object.entries(choices).map(([k, v]) => ({
        day: k,
        choice: v,
        event_month_id: month.id,
        user_id: maybeExistingUserId,
    }));

    await postgres.begin(async (postgres) => {
        await postgres`
            DELETE FROM event.availability_choices
            WHERE
                event_month_id=${month.id}
                AND user_id=${maybeExistingUserId};
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
