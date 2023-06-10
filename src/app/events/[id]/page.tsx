"use client";

import { EventProvider } from "../../../../lib/context/EventProvider";
import EventView from "./EventView";

type PageProps = {
    params: { id: string };
    searchParams: { [key: string]: string | string[] | undefined };
};

export default async function Page({ params }: PageProps) {
    const { id: eventId } = params;

    return (
        <EventProvider eventId={eventId}>
            <EventView />
        </EventProvider>
    );
}
