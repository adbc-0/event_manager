"use client";

import { useEffect, useRef } from "react";
import { useParams } from "next/navigation";

// ToDo: ~create alias~
import { useEvent } from "../../../../lib/context/EventProvider";
import { useAuth } from "~/hooks/use-auth";
import EventCalendar from "~/components/EventCalendar/EventCalendar";
import { WelcomeSection } from "./WelcomeSection";
import { UsernameDialog } from "./UsernameDialog";

export default function EventView() {
    const { id: eventId } = useParams();
    if (!eventId) {
        throw new Error("Missing event url param");
    }

    const { username, setUsername } = useAuth();
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
            <WelcomeSection
                username={username}
                eventName={event.name}
                openModal={openIdentityModal}
            />
            <EventCalendar />
            <UsernameDialog
                usernameDialogRef={usernameDialogRef}
                setUsername={setUsername}
                username={username}
            />
        </div>
    );
}
