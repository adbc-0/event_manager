"use client";

import { useRef } from "react";
import Image from "next/image";

import addIcon from "~/public/new.svg";
import { PostEvent } from "../api/events/actions";
import { Button } from "~/components/Button/Button";
import { GlassmorphicPane } from "~/components/GlassmorphicPane/GlassmorphicPane";

export function NewEventAction() {
    const dialogRef = useRef<HTMLDialogElement | null>(null);

    return (
        <>
            <Button
                type="button"
                theme="BASIC"
                className="w-9 h-9"
                onClick={() => dialogRef.current?.showModal()}
            >
                <Image
                    src={addIcon}
                    className="cursor-pointer m-auto"
                    width={24}
                    height={24}
                    alt="edit username"
                />
            </Button>
            <dialog ref={dialogRef} className="p-0 rounded-md">
                <GlassmorphicPane innerClassName="py-8 px-12">
                    <form className="text-center" action={PostEvent}>
                        <h2 className="text-xl mb-2">Create new event</h2>
                        <input
                            aria-label="new event name"
                            className="text-center border border-black my-6 py-2 block m-auto rounded-md bg-zinc-900 autofill:bg-zinc-950 bg-clip-padding backdrop-filter backdrop-blur-3xl bg-opacity-40"
                            type="text"
                            placeholder="event name"
                            name="event_name"
                            autoCorrect="off"
                            required
                            maxLength={20}
                            onFocus={(e) => e.target.select()}
                            autoFocus
                        />
                        <div className="flex justify-evenly gap-2">
                            <Button
                                type="reset"
                                theme="DISCARD"
                                className="flex-1 py-2"
                                onClick={() => dialogRef.current?.close()}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                theme="SAVE"
                                className="flex-1 py-2"
                            >
                                Submit
                            </Button>
                        </div>
                    </form>
                </GlassmorphicPane>
            </dialog>
        </>
    );
}
