"use client";

import {
    FormEvent,
    useEffect,
    useRef,
    useState
} from "react";


import { useAuth } from "~/hooks/use-auth";
import { useIsClient } from "~/hooks/use-is-client";
import Calendar from "~/components/Calendar/Calendar";
import { Event, UsersAvailability } from "../../../../typescript";

type RouteParams = {
    id: string;
}

type ReactProps = {
    params: RouteParams;
}

// you cannot use metadata with client component
// export const metadata = {
//     title: 'Schedule event',
//     description: 'Schedule some event',
// };

// https://beta.nextjs.org/docs/data-fetching/generating-static-params
// export async function generateStaticParams() {
//     const monthEvents = await new Promise<RouteParams[]>((resolve) => {
//         resolve([{ id: '1' }]);
//     });

//     return monthEvents.map(({ id }) => id);
// }


function fetchEventCalendar(eventId: string): Promise<Event> {
    console.log('fetching for event:', eventId);
    // Add choices
    return Promise.resolve({
        eventName: 'DnD',
        users: {
            orzel: { available: [1], notAvailable: [2], maybeAvailable: [3] },
            bidon: { available: [1], notAvailable: [3], maybeAvailable: [] }
        },
    });
}

// czy ktos bez setowania username powinien moc obejrzec kalendarz?

export default function EventCalendar({ params }: ReactProps) {
    const { id: eventId } = params;

    const isClient = useIsClient();
    const { username, setUsername } = useAuth();

    const nameInputRef = useRef<HTMLInputElement>(null);
    const [eventName, setEventName] = useState<string | null>(null);
    const [authDialog, setAuthDialog] = useState(false);
    const [calendarAvailability, setCalendarAvailability] = useState<UsersAvailability | null>(null);

    const renderIdentityDialog = (!username && isClient) || authDialog;

    const openIdentityModal = () => {
        setAuthDialog(true);
    };

    const closeIdentityModal = () => {
        setAuthDialog(false);
    };

    const saveUserName = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const usernameInputVal = nameInputRef.current?.value;
        if (!usernameInputVal) {
            return;
        }

        setUsername(usernameInputVal);
        setAuthDialog(!usernameInputVal);
        console.log('ToDo: refetch user availability');
    };

    useEffect(() => {
        // ToDo: Abort controller
        // ToDo: Error handling
        async function initEventCalendar() {
            const response = await fetchEventCalendar(eventId);
            setCalendarAvailability(response.users);
            setEventName(response.eventName);
        }

        initEventCalendar();
    }, []);

    useEffect(() => {
        document.title = `Event - ${eventName ?? ''}`;
    }, [eventName]);

    if (!calendarAvailability) {
        return null;
    }

    return (
        <div>
            <h1 className="text-center">{eventName}</h1>
            <div className="flex justify-center">
                <h2>Welcome {username}</h2>
                <button type="button" onClick={openIdentityModal}>Change name</button>
            </div>
            {/* <Legend /> */}
            {/* <div className="text-center">
                <p>Yellow - if needed</p>
                <p>Red - no</p>
                <p>Green - yes</p>
            </div> */}
            {<Calendar availability={calendarAvailability} eventId={eventId} username={username} />}
            {/* <UsernameForm /> */}
            {renderIdentityDialog && (
                <form onSubmit={saveUserName}>
                    <p>Add name</p>
                    <input ref={nameInputRef} />
                    <button type="button" onClick={closeIdentityModal}>Cancel</button>
                    <button type="submit">Submit</button>
                </form>
            )}
        </div>
    );
}