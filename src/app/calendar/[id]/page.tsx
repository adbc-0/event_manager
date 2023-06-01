"use client";

import {
    FormEvent,
    useEffect,
    useRef,
    useState
} from "react";
import Image from "next/image";

import { useAuth } from "~/hooks/use-auth";
import editIcon from "~/public/edit.svg"; 
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

    const { username, setUsername } = useAuth();

    const nameInputRef = useRef<HTMLInputElement>(null);
    const usernameFormRef = useRef<HTMLFormElement>(null);
    const usernameDialogRef = useRef<HTMLDialogElement>(null);

    const [eventName, setEventName] = useState<string | null>(null);
    const [calendarAvailability, setCalendarAvailability] = useState<UsersAvailability | null>(null);

    const openIdentityModal = () => {
        usernameDialogRef.current?.showModal();        
    };

    const closeIdentityModal = () => {
        usernameFormRef.current?.reset();
        usernameDialogRef.current?.close();
    };

    const saveUserName = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const usernameInputVal = nameInputRef.current?.value;
        if (!usernameInputVal) {
            return;
        }

        setUsername(usernameInputVal);
        usernameDialogRef.current?.close();
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

    // ToDo: Page title for dynamic client routes
    useEffect(() => {
        document.title = `Event - ${eventName ?? ''}`;
    }, [eventName]);

    if (!calendarAvailability) {
        return null;
    }

    return (
        <div className="h-full grid grid-cols-1 auto-rows-[1fr_4fr_1fr] items-center md:items-start">
            <section>
                <h1 className="text-center text-3xl p-5">{eventName}</h1>
                {username && <div className="flex justify-center m-5">
                    <h2 className="text-2xl">Welcome {username}</h2>
                    <Image className="cursor-pointer" onClick={openIdentityModal} src={editIcon} alt="edit username" />
                </div>}
            </section>
            {/* <Legend /> */}
            {/* <div className="text-center">
                <p>Yellow - if needed</p>
                <p>Red - no</p>
                <p>Green - yes</p>
            </div> */}
            <Calendar availability={calendarAvailability} eventId={eventId} username={username} />
            {/* <UsernameForm /> */}
            <dialog ref={usernameDialogRef} className="bg-gray-100 rounded-md p-6 bg-clip-padding backdrop-filter backdrop-blur-3xl bg-opacity-10 border border-white/25 max-w-sm" open={!username}>
                <form ref={usernameFormRef} method="dialog" onSubmit={saveUserName}>
                    <h2 className="text-center text-xl">Insert username</h2>
                    <p className="text-sm">use the same username across devices</p>
                    <input className="border border-black rounded-sm my-6 block m-auto" ref={nameInputRef} defaultValue={username} />
                    <div className="flex justify-evenly">
                        <button className="bg-red-400 flex-auto mx-2 py-2 rounded-md" type="button" onClick={closeIdentityModal}>Cancel</button>
                        <button className="bg-green-400 flex-auto mx-2 py-2 rounded-md" type="submit">Submit</button>
                    </div>
                </form>
            </dialog>
        </div>
    );
}