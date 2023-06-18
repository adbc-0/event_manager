"use client";

import { EventProvider } from "../../../../lib/context/EventProvider";
import EventView from "./EventView";

type PageProps = {
    params: { id: string };
    searchParams: { [key: string]: string | string[] | undefined };
};

// ToDo: There is somwhere one additional fetch of calendar. Localize it.

export default function Page({ params }: PageProps) {
    const { id: eventId } = params;

    return (
        <EventProvider eventId={eventId}>
            <EventView />
        </EventProvider>
    );
}
