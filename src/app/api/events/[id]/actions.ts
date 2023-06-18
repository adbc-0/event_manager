"use server";

import { revalidatePath } from "next/cache";

import { postgres } from "~/services/postgres";

export async function changeAvailability(
    choices: Record<string, string>,
    eventId: string,
    ownerId: number,
    month: number,
) {
    const [{ month_id }] = await postgres<{ month_id: number }[]>`
        SELECT
            id
        FROM event.events_months
        WHERE
            event_id=${eventId}
            AND month=${month}
        ;
    `;

    if (!month_id) {
        throw new Error("unknown month id");
    }

    const choicesToValues = () =>
        Object.entries(choices).map(
            ([k, v]) => `(${k}, ${v}, ${month_id}, ${ownerId})`,
        );

    await postgres.begin(async (postgres) => {
        await postgres`
            DELETE FROM event.availability_choices
            WHERE
                event.event_month_id=${month_id}
                AND event.user_id=${ownerId};
        `;

        await postgres`
            INSERT INTO event.availability_choices (day, choice, event_month_id, user_id)
            VALUES
                ${choicesToValues()}
        `;
    });

    revalidatePath(`/calendar/${eventId}`);
}
