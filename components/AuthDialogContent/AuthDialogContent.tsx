import { useParams } from "next/navigation";

import { handleQueryError } from "~/utils/index";
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
        <div className="flex flex-col gap-4">
            <div className="flex justify-between content-center items-center">
                <h2 className="text-xl">Select days as:</h2>
            </div>
            <div className="flex flex-col">
                {usersQuery.data.map((user) => (
                    <button
                        key={user.id}
                        type="button"
                        className="grow border border-zinc-900 border-b-0 last:border-b block py-2 bg-neutral-800 hover:bg-secondary hover:text-black hover:transition-colors ease-out duration-300"
                        onClick={() => selectUser(user)}
                    >
                        {user.username}
                    </button>
                ))}
            </div>
        </div>
    );
}