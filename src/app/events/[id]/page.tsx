"use client";

import { ReactProps } from "../../../../typescript";
import { EventProvider } from "../../../../lib/context/EventProvider";
import EventView from "./EventView";

type RouteParams = {
    id: string;
}

type EventProps = ReactProps & {
    params: RouteParams;
}

export default function Event({ params }: EventProps) {
    const { id: eventId } = params;

    return (
        <EventProvider eventId={eventId}>
            <EventView />
        </EventProvider>
    );
}