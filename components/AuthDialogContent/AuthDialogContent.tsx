import { useParams } from "next/navigation";

import { handleQueryError } from "~/std";
import { useAnonAuth } from "~/hooks/use-anon-auth";
import { useEventUsersQuery } from "~/queries/useEventUsersQuery";
import { EventUser } from "~/app/api/events/[eventId]/users/route";
import { EventRouteParams } from "~/typescript";

export function AuthDialogContent() {
    const { id: eventId } = useParams<EventRouteParams>();
    if (!eventId) {
        throw new Error("Missing event url param");
    }

    const { setUsername } = useAnonAuth(eventId);
    const usersQuery = useEventUsersQuery(eventId);

    if (usersQuery.isError) {
        handleQueryError(usersQuery.error);
    }
    if (!usersQuery.data) {
        return null;
    }

    const selectUser = (user: EventUser) => {
        setUsername(user);
    };

    return (
        <div className="py-2 px-4 flex flex-col">
            {usersQuery.data.map((user) => (
                <button
                    key={user.id}
                    type="button"
                    className="border border-border border-b-0 first:rounded-t-lg last:rounded-b-lg last:border-b bg-card-background text-card-foreground py-2 hover:brightness-110 hover:transition-colors ease-out duration-300"
                    onClick={() => selectUser(user)}
                >
                    {user.username}
                </button>
            ))}
        </div>
    );
}
