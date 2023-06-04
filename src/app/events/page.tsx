import { Metadata } from "next";
import Link from "next/link";

type EventResponse = {
    id: number;
    name: string;
}

async function fetchEvents(): Promise<EventResponse[]> {
    // ToDo: remove no-store cache value
    const response = await fetch('http://localhost:3000/api/events', {
        cache: 'no-store'
    });
    if (!response.ok) {
        throw new Error('failed to fetch the data');
    }

    return response.json();
}

export const metadata: Metadata = {
    title: 'Chaos - Events',
    description: 'Listing of all created event calendars',
};

export default async function Calendar() { 
    const events = await fetchEvents();
    return (
        <div>
            <h1>All events</h1>
            <div>
                {events.map(({ id, name }) => (
                    <div key={id}>
                        <Link href={`/events/${id}`}>{name}</Link>
                    </div>
                    
                ))}
            </div>
        </div>
    );
}
