import { Metadata } from "next";
import Link from "next/link";

import { NewEventAction } from "./NewEventAction";

type EventListResponse = {
    id: number;
    name: string;
};

async function fetchEvents(): Promise<EventListResponse[]> {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API}/api/events`);
    if (!response.ok) {
        throw new Error("failed to fetch the data");
    }

    return response.json();
}

export const metadata: Metadata = {
    title: "Chaos - Events",
    description: "Listing of all created event calendars",
};

export default async function Page() {
    const events = await fetchEvents();
    return (
        <div className="text-center">
            <div className="max-w-lg m-auto pt-10 px-3">
                <div className="flex justify-between items-end">
                    <h2>Events</h2>
                    <NewEventAction />
                </div>
                <div className="border border-black bg-neutral-700 mt-1 rounded-md">
                    {events.length ? (
                        <div className="my-10 w-60 m-auto border border-black">
                            {events.map(({ id, name }) => (
                                <Link
                                    key={id}
                                    href={`/events/${id}`}
                                    className="block py-2 bg-neutral-800 hover:brightness-110 last:border-b-0 border-b border-b-zinc-900"
                                >
                                    {name}
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <h3 className="py-3">No created events were found</h3>
                    )}
                </div>
            </div>
        </div>
    );
}
