"use client";

import {
    FormEvent,
    useEffect,
    useRef,
    useState
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