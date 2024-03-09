"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";

import { useEventQuery } from "~/queries/useEventQuery";
import { LoadingSpinner } from "~/components/LoadingSpinner/LoadingSpinner";
import { Calendar } from "./Calendar";
import { EventRouteParams } from "~/typescript";

export function EventView() {
    const { id: eventId } = useParams<EventRouteParams>();
    if (!eventId) {
        throw new Error("Missing event url param");
    }

    const { data: event } = useEventQuery(eventId);

    useEffect(() => {
        document.title = `Event - ${event?.name ?? "loading..."}`;
    }, [event?.name]);

    return (
        <div className="grid grid-cols-1 items-center auto-rows-min md:auto-rows-3">
            <div className="mx-2 my-8">
                <h1 className="bg-card-background text-center max-w-sm w-full mx-auto text-3xl py-2 px-8 rounded-md shadow-inner">
                    {event?.name ?? <LoadingSpinner className="mx-auto h-9" />}
                </h1>
            </div>
            <Calendar />
        </div>
    );
}
