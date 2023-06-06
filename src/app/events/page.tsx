import { Metadata } from "next";
import Link from "next/link";

type EventResponse = {
    id: number;
    name: string;
};

async function fetchEvents(): Promise<EventResponse[]> {
    const response = await fetch("http://localhost:3000/api/events", {
        cache: "no-store",
    });
    if (!response.ok) {
        throw new Error("failed to fetch the data");
    }

    return response.json();
}

export const metadata: Metadata = {
    title: "Chaos - Events",
    description: "Listing of all created event calendars",
};

// ToDo: DELETE event
// ToDo: CREATE event

export default async function Calendar() {
    const events = await fetchEvents();
    return (
        <div className="text-center">
            <h1 className="py-3">All events</h1>
            <div>
                {events.length ? (
                    events.map(({ id, name }) => (
                        <div key={id}>
                            <Link href={`/events/${id}`}>{name}</Link>
                        </div>
                    ))
                ) : (
                    <p>No events have been created</p>
                )}
            </div>
        </div>
    );
}
