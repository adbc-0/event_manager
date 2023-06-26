import { postgres } from "~/services/postgres";

export async function getAnonymousUserId(userName: string | null | undefined) {
    if (!userName) {
        throw new Error("user name is missing");
    }

    const [{ id }] = await postgres<{ id: string }[]>`
        SELECT id
        FROM system_user.system_users
        WHERE
            role_id=2
            AND name=${userName};
    `;
    return id;
}
