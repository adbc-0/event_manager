import { QueryFunctionContext, useQuery } from "@tanstack/react-query";

import { RequestResponse } from "~/app/api/events/[eventId]/users/route";
import { ServerError } from "~/utils/index";

export function usernameSelector(users: RequestResponse) {
    return users.map(({ username }) => username);
}

async function fetchEventUsers({ signal, queryKey }: QueryFunctionContext) {
    const eventId = queryKey.at(1);
    const response = await fetch(`/api/events/${eventId}/users`, {
        method: "GET",
        signal,
    });
    if (!response.ok) {
        const error = await response.json();
        throw new ServerError(error.message, response.status);
    }
    return response.json();
}

export const usersKeys = {
    ofEvent: (eventId: string) => ["users", eventId],
};

export function useEventUsersQuery<TData = RequestResponse>(
    eventId: string,
    selector?: (data: RequestResponse) => TData,
) {
    return useQuery({
        queryKey: usersKeys.ofEvent(eventId),
        queryFn: fetchEventUsers,
        select: selector,
    });
}
