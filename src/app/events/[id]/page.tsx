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
import { EventResponse, AllUsersAvailabilityChoices } from "../../../../typescript";
import { getCurrentMonth } from "~/utils/date";

type RouteParams = {
    id: string;
}

type ReactProps = {
    params: RouteParams;
}

// ToDo: Improve background

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


function fetchEventCalendar(eventId: string, month: number): Promise<EventResponse> {
    console.log('fetching for event:', eventId);
    if (month === 5) {
        return Promise.resolve({
            eventName: 'DnD',
            month,
            users: {
                orzel: { available: [1], notAvailable: [2], maybeAvailable: [3] },
                bidon: { available: [1], notAvailable: [3], maybeAvailable: [] }
            },
        });
    }

    return Promise.resolve({
        eventName: 'DnD',
        month,
        users: {}
    });
}

export default function EventCalendar({ params }: ReactProps) {
    const { id: eventId } = params;

    const { username, setUsername } = useAuth();

    const nameInputRef = useRef<HTMLInputElement>(null);
    const usernameFormRef = useRef<HTMLFormElement>(null);
    const usernameDialogRef = useRef<HTMLDialogElement>(null);

    const [eventName, setEventName] = useState<string | null>(null);
    const [calendarAvailability, setCalendarAvailability] = useState<AllUsersAvailabilityChoices | null>(null);

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
        // recalculate availabilities
        usernameDialogRef.current?.close();
    };

    useEffect(() => {
        // ToDo: Abort controller
        // ToDo: Error handling
        async function initEventCalendar() {
            const response = await fetchEventCalendar(eventId, getCurrentMonth());
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