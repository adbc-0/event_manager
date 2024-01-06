import {
    HydrationBoundary,
    dehydrate,
    QueryClient,
} from "@tanstack/react-query";

import { encodeEventParamDate } from "~/utils/eventUtils";
import { usersKeys } from "~/queries/useEventUsersQuery";
import { calendarKeys } from "~/queries/useEventQuery";
import { getCurrentDate } from "~/services/dayJsFacade";
import { EventView } from "./EventCalendar/EventView";
import { AuthMobile } from "~/components/AuthMobile/AuthMobile";
import { CurrentDate } from "~/typescript";

export const metadata = {
    title: "Event - loading...",
    description: "Manage event",
};

type PageProps = {
    params: { id: string };
    searchParams: { [key: string]: string | string[] | undefined };
};

function getFullAPIPath(url: string) {
    return `${process.env.NEXT_PUBLIC_API_URL}${url}`;
}

async function Page({ params }: PageProps) {
    const eventId = params.id;

    const queryClient = new QueryClient();

    await queryClient.prefetchQuery({
        queryKey: usersKeys.ofEvent(eventId),
        queryFn: async ({ signal }) => {
            const fullUrl = getFullAPIPath(`/api/events/${eventId}/users`);
            const response = await fetch(fullUrl, {
                method: "GET",
                signal,
            });
            return response.json();
        },
    });

    await queryClient.prefetchQuery({
        queryKey: calendarKeys.ofEventAndMonth(eventId, getCurrentDate()),
        queryFn: async ({ signal, queryKey }) => {
            const currentDate = queryKey[2] as CurrentDate;
            const { month, year } = currentDate;
            const searchParams = new URLSearchParams({
                date: encodeEventParamDate(month, year),
            });
            const fullUrl = getFullAPIPath(
                `/api/events/${eventId}?${searchParams.toString()}`,
            );
            const response = await fetch(fullUrl, {
                method: "GET",
                signal,
            });
            return response.json();
        },
    });

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <EventView />
            <AuthMobile />
        </HydrationBoundary>
    );
}

export default Page;
