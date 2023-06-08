"use client";

import { useEffect, useRef } from "react";
import { useParams } from "next/navigation";

// ToDo: ~create alias~
import { useEvent } from "../../../../lib/context/EventProvider";
import EventCalendar from "~/components/EventCalendar/EventCalendar";
import { UsernameSection } from "./UsernameSection";
import { UsernameDialog } from "./UsernameDialog";

export default function EventView() {
    const { id: eventId } = useParams();
    if (!eventId) {
        throw new Error("Missing event url param");
    }

    const { event } = useEvent();

    const usernameDialogRef = useRef<HTMLDialogElement>(null);

    const openIdentityModal = () => {
        usernameDialogRef.current?.showModal();
    };

    // Page title for dynamic client routes
    useEffect(() => {
        document.title = `Event - ${event.name ?? "Loading..."}`;
    }, [event.name]);

    return (
        <div className="grid grid-cols-1 items-center auto-rows-min min-h-full-dvh md:auto-rows-3">
            <h1 className="text-center text-3xl p-5">{event.name}</h1>
            <UsernameSection openModal={openIdentityModal} />
            <EventCalendar />
            <UsernameDialog ref={usernameDialogRef} />
        </div>
    );
}
