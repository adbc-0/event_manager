import { useAtom } from "jotai";
import { QueryFunctionContext, useQuery } from "@tanstack/react-query";

import { CALENDAR_REFETCH_INTERVAL } from "~/constants";
import { calendarDateAtoms } from "~/atoms";
import { ServerError, encodeEventParamDate } from "~/utils/index";
import { CurrentDate, EventResponse } from "~/typescript";

async function fetchEvent({ signal, queryKey }: QueryFunctionContext) {
    const [, eventId, calendarDate] = queryKey;
    const { month, year } = calendarDate as CurrentDate;
    const searchParams = new URLSearchParams({
        date: encodeEventParamDate(month, year),
    });
    const response = await fetch(
        `/api/events/${eventId}?${searchParams.toString()}`,
        { signal, method: "GET" },
    );
    if (!response.ok) {
        const error = await response.json();
        throw new ServerError(error.message, response.status);
    }
    return response.json();
}

export const calendarKeys = {
    ofEventAndMonth: (eventId: string, date: CurrentDate) => [
        "calendar",
        eventId,
        date,
    ],
};

export function useEventQuery(eventId: string) {
    const [calendarDate] = useAtom(calendarDateAtoms.readDateAtom);
    return useQuery<EventResponse>({
        queryKey: calendarKeys.ofEventAndMonth(eventId, calendarDate),
        queryFn: fetchEvent,
        refetchInterval: CALENDAR_REFETCH_INTERVAL,
    });
}
