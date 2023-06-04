"use client";

import {
    FormEvent,
    useEffect,
    useRef,
} from "react";
import Image from "next/image";
import { useParams } from 'next/navigation';

import { useAuth } from "~/hooks/use-auth";
import editIcon from "~/public/edit.svg"; 
import EventCalendar from "~/components/EventCalendar/EventCalendar";
import { useEvent } from "../../../../lib/context/EventProvider";

// you cannot use metadata with client component
// export const metadata = {
//     title: 'Schedule event',
//     description: 'Schedule some event',
// };

export default function EventView() {
    const { id: eventId } = useParams();
    if (!eventId) {
        throw new Error('Missing event url param');
    }
    const { username, setUsername } = useAuth();
    const { allChoices, event } = useEvent();

    const nameInputRef = useRef<HTMLInputElement>(null);
    const usernameFormRef = useRef<HTMLFormElement>(null);
    const usernameDialogRef = useRef<HTMLDialogElement>(null);

    const openIdentityModal = () => {
        usernameDialogRef.current?.showModal();        
    };

    const closeIdentityModal = () => {
        if (!usernameFormRef.current) {
            throw new Error('Ref not fonnd');
        }
        if (!usernameDialogRef.current) {
            throw new Error('Ref not fonnd');
        }

        usernameFormRef.current.reset();
        usernameDialogRef.current.close();
    };

    const saveUserName = (e: FormEvent<HTMLFormElement>) => {
        if (!usernameFormRef.current) {
            throw new Error('Ref not fonnd');
        }
        if (!usernameDialogRef.current) {
            throw new Error('Ref not fonnd');
        }
        
        e.preventDefault();

        const usernameInputVal = nameInputRef.current?.value;
        if (!usernameInputVal) {
            return;
        }

        setUsername(usernameInputVal);
        // recalculate availabilities
        usernameDialogRef.current.close();
    };

    // Page title for dynamic client routes
    useEffect(() => {
        document.title = `Event - ${event.name ?? 'Loading...'}`;
    }, [event.name]);


    if (!username) {
        return null;
    }

    // ToDo: Safe guard to be removed
    if (!Object.keys(allChoices).length) {
        return null;
    }

    return (
        <div className="h-full grid grid-cols-1 auto-rows-[1fr_4fr_1fr] items-center md:items-start">
            <section>
                <h1 className="text-center text-3xl p-5">{event.name}</h1>
                {username && <div className="flex justify-center m-5">
                    <h2 className="text-2xl">Welcome {username}</h2>
                    <Image src={editIcon} className="cursor-pointer" width={24} height={24} onClick={openIdentityModal} alt="edit username" />
                </div>}
            </section>
            <EventCalendar />
            {/* ToDo: <UsernameForm /> */}
            {/* ToDo: Make component for double border with transparency */}
            <dialog ref={usernameDialogRef} className="p-0 bg-gray-100 rounded-md bg-clip-padding backdrop-filter backdrop-blur-3xl bg-opacity-10 max-w-sm border border-black" open={!username}>
                <div className="border border-white/25 rounded-md p-6">
                    <form ref={usernameFormRef} method="dialog" onSubmit={saveUserName}>
                        <h2 className="text-center text-xl">Insert username</h2>
                        <p className="text-sm">use the same username across devices</p>
                        <input ref={nameInputRef} className="border border-black my-6 py-2 block m-auto text-center text-black rounded-md" aria-label="username input field" defaultValue={username} />
                        <div className="flex justify-evenly">
                            <button className="bg-red-400 flex-auto mx-2 py-2 rounded-md shadow-md" type="button" onClick={closeIdentityModal}>Cancel</button>
                            <button className="bg-green-400 flex-auto mx-2 py-2 rounded-md shadow-md" type="submit">Submit</button>
                        </div>
                    </form>
                </div>
            </dialog>
        </div>
    );
}