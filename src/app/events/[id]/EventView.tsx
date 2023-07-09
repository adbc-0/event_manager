"use client";

import { useEffect, useRef } from "react";
import { useParams } from "next/navigation";

import { useEvent } from "~/context/EventProvider";
import { CalendarControl } from "./DialogControl";
import { RemovalDialog } from "./RemovalDialog";
import { ListViewDialog } from "./ListViewDialog";
import { CalendarTopIcons } from "./CalendarTopIcons";

export default function EventView() {
    const { event } = useEvent();
    const { id: eventId } = useParams();
    if (!eventId) {
        throw new Error("Missing event url param");
    }

    const listViewDialog = useRef<HTMLDialogElement>(null);
    const removalDialogRef = useRef<HTMLDialogElement>(null);

    useEffect(() => {
        document.title = `Event - ${event.name ?? "Loading..."}`;
    }, [event.name]);

    const openViewListDialog = () => {
        listViewDialog.current?.showModal();
    };
    const openRemovalDialog = () => {
        removalDialogRef.current?.showModal();
    };

    return (
        <div className="grid grid-cols-1 items-center auto-rows-min md:auto-rows-3">
            <h1 className="text-center text-3xl p-5">{event.name}</h1>
            <CalendarTopIcons
                openRemovalDialog={openRemovalDialog}
                openViewListDialog={openViewListDialog}
            />
            <CalendarControl />
            {/* --- DIALOGS SECTION --- */}
            <RemovalDialog ref={removalDialogRef} />
            <ListViewDialog ref={listViewDialog} />
        </div>
    );
}
