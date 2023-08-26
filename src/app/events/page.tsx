import { Metadata } from "next";
import Link from "next/link";

import { NewEventAction } from "./NewEventAction";
import { postgres } from "~/services/postgres";
import { hashId } from "~/services/hashId";

type EventsResponse = {
    id: number;
    name: string;
    owner_id: number;
};

type EventListResponse = {
    id: string;
    name: string;
};

async function fetchEvents(): Promise<EventListResponse[]> {
    const rows = await postgres<EventsResponse[]>`
        SELECT id, name, owner_id FROM event.events;
    `;

    return rows.map((row) => ({
        ...row,
        id: hashId.encode(row.id.toString()),
    }));
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
                <div className="border border-zinc-900 bg-neutral-700 mt-1 rounded-md">
                    {events.length ? (
                        <div className="my-10 w-60 m-auto border border-zinc-900">
                            {events.map(({ id, name }) => (
                                <Link
                                    key={id}
                                    href={`/events/${id}`}
                                    className="block py-2 bg-neutral-800  border-b border-b-zinc-900 hover:bg-cyan-200 hover:text-black last:border-b-0 hover:transition-colors ease-out duration-300"
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
