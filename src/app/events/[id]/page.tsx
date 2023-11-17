"use client";

import { EventProvider } from "../../../../lib/context/EventProvider";

import { MobileMenu } from "~/components/MobileMenu/MobileMenu";
import EventView from "./EventView";

type PageProps = {
    params: { id: string };
    searchParams: { [key: string]: string | string[] | undefined };
};

export default function Page({ params }: PageProps) {
    const { id: eventId } = params;

    return (
        <EventProvider eventId={eventId}>
            <EventView />
            <MobileMenu />
        </EventProvider>
    );
}
