"use client";

import { useEffect, useRef } from "react";
import { useParams } from "next/navigation";

import { useEvent } from "~/context/EventProvider";
import { EventCalendar } from "~/components/EventCalendar/EventCalendar";
import { UsernameSection } from "./UsernameSection";
import { UsernameDialog } from "./UsernameDialog";
import { DialogControl } from "./DialogControl";

export default function EventView() {
    const { event } = useEvent();
    const { id: eventId } = useParams();
    if (!eventId) {
        throw new Error("Missing event url param");
    }

    const usernameDialogRef = useRef<HTMLDialogElement>(null);

    useEffect(() => {
        document.title = `Event - ${event.name ?? "Loading..."}`;
    }, [event.name]);

    const openIdentityModal = () => {
        usernameDialogRef.current?.showModal();
    };

    return (
        <div className="grid grid-cols-1 items-center auto-rows-min min-h-full-dvh md:auto-rows-3">
            <h1 className="text-center text-3xl p-5">{event.name}</h1>
            <UsernameSection openModal={openIdentityModal} />
            <EventCalendar />
            <DialogControl />
            <UsernameDialog ref={usernameDialogRef} />
        </div>
    );
}
