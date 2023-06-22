"use server";

import { revalidatePath } from "next/cache";

import { postgres } from "~/services/postgres";
import { CurrentDate, OwnAvailability } from "~/typescript";

export async function changeAvailability(
    eventId: string,
    choices: OwnAvailability,
    { month, year }: CurrentDate
) {
    // ToDo: I can take user value from localstorage/token
    const ownerId = 1;
    const [{ id: monthId }] = await postgres<{ id: number }[]>`
        SELECT
            id
        FROM event.events_months
        WHERE
            event_id=${eventId}
            AND year=${year}
            AND month=${month}
        ;
    `;

    if (!monthId) {
        throw new Error("unknown month id");
    }

    // ToDo: temporary function (remove it after)
    const transformAvailability = (availability: string) => {
        if (availability === "MAYBE_AVAILABLE") {
            return "maybe_available";
        }
        if (availability === "UNAVAILABLE") {
            return "unavailable";
        }
        if (availability === "AVAILABLE") {
            return "available";
        }
        throw new Error("unknown availability type");
    };

    const newEvents = Object.entries(choices).map(([k, v]) => ({
        day: k,
        choice: transformAvailability(v),
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
