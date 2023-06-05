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

    // ToDo: Safe guard to be removed
    if (!Object.keys(allChoices).length) {
        return null;
    }

    return (
        <div className="grid grid-cols-1 items-center auto-rows-min md:auto-rows-[1fr_1fr_1fr]">
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
            <dialog ref={usernameDialogRef} className="bg-gray-100 bg-clip-padding backdrop-filter backdrop-blur-3xl bg-opacity-10 p-0 rounded-md max-w-sm border border-black" open={!username}>
                <div className="border border-white/25 rounded-md p-6">
                    <form ref={usernameFormRef} method="dialog" onSubmit={saveUserName}>
                        <h2 className="text-center text-xl">Insert username</h2>
                        <p className="text-sm">use the same username across devices</p>
                        <input ref={nameInputRef} className="border border-black my-6 py-2 block m-auto text-center rounded-md bg-zinc-900 bg-clip-padding backdrop-filter backdrop-blur-3xl bg-opacity-40" aria-label="username input field" defaultValue={username} required autoFocus />
                        <div className="flex justify-evenly">
                            {/* ToDo: styles for disabled buttons */}
                            <button className="bg-red-400 flex-auto mx-2 py-2 rounded-md shadow-md border border-black text-black" type="button" disabled={!username} onClick={closeIdentityModal}>Cancel</button>
                            <button className="bg-green-400 flex-auto mx-2 py-2 rounded-md shadow-md border border-black text-black" type="submit">Submit</button>
                        </div>
                    </form>
                </div>
            </dialog>
        </div>
    );
}