import { postgres } from "~/services/postgres";
import { CurrentDate } from "../../../typescript/eventTypes";

export async function getAnonymousUserId(
    userName: string | null | undefined,
): Promise<string> {
    if (!userName) {
        throw new Error("user name is missing");
    }

    const [user] = await postgres<{ id: string }[]>`
        SELECT id
        FROM system_user.system_users
        WHERE
            role_id=2
            AND name=${userName};
    `;

    return user.id;
}

export async function createMonth(date: CurrentDate, eventId: string) {
    const [month] = await postgres<{ id: number }[]>`
        INSERT INTO event.events_months (month, year, event_id)
        VALUES (${date.month}, ${date.year}, ${eventId})
        RETURNING id;
    `;

    return month;
}
