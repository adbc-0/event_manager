"use client";

import { useEffect, useRef } from "react";
import { useParams } from "next/navigation";

import { useEvent } from "~/context/EventProvider";

import { CalendarControl } from "./DialogControl";
import { CyclicDialog } from "./CyclicDialog";
import { ListViewDialog } from "./ListViewDialog";
import { CalendarTopIcons } from "./CalendarTopIcons";
import { EventCalendar } from "~/components/EventCalendar/EventCalendar";

export default function EventView() {
    const { event } = useEvent();
    const { id: eventId } = useParams();
    if (!eventId) {
        throw new Error("Missing event url param");
    }

    const cyclicDialogRef = useRef<HTMLDialogElement>(null);
    const listViewDialogRef = useRef<HTMLDialogElement>(null);

    useEffect(() => {
        document.title = `Event - ${event.name ?? "Loading..."}`;
    }, [event.name]);

    const openCyclicSelectionDialog = () => {
        cyclicDialogRef.current?.showModal();
    };
    const openViewListDialog = () => {
        listViewDialogRef.current?.showModal();
    };

    return (
        <div className="grid grid-cols-1 items-center auto-rows-min md:auto-rows-3">
            <div className="mx-6 my-8">
                <h1 className="w-min mx-auto text-3xl py-2 px-8 border border-black rounded-md shadow-inner bg-zinc-900">
                    {event.name ?? "..."}
                </h1>
            </div>
            {/* ToDo: Here is an issue with grid */}
            <div>
                <CalendarTopIcons
                    openCyclickDialog={openCyclicSelectionDialog}
                    openViewListDialog={openViewListDialog}
                />
                <EventCalendar />
            </div>
            <CalendarControl />
            {/* --- DIALOGS SECTION --- */}
            <CyclicDialog ref={cyclicDialogRef} />
            <ListViewDialog ref={listViewDialogRef} />
        </div>
    );
}
