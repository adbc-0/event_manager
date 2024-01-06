import { QueryFunctionContext, useQuery } from "@tanstack/react-query";

import { RequestResponse } from "~/app/api/events/[eventId]/rules/route";

export const rulesKeys = {
    ofEventAndUser: (eventId: string, userId: string) => [
        "rules",
        eventId,
        userId,
    ],
};

export function useRuleQuery(userId: number | undefined, eventId: string) {
    return useQuery<RequestResponse>({
        enabled: Boolean(userId),
        queryKey: rulesKeys.ofEventAndUser(eventId, String(userId)),
        queryFn: async ({ signal }: QueryFunctionContext) => {
            const searchParams = new URLSearchParams({
                userId: String(userId),
            });
            const response = await fetch(
                `/api/events/${eventId}/rules?${searchParams.toString()}`,
                { method: "GET", signal },
            );
            return response.json();
        },
    });
}
