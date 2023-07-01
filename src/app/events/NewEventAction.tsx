"use client";

import { useRef, useTransition } from "react";
import Image from "next/image";

import okIcon from "~/public/acceptButton.svg";
import cancelIcon from "~/public/rejectButton.svg";

import addIcon from "~/public/new.svg";
import { AddEvent } from "../api/events/actions";
import { Button } from "~/components/Button/Button";
import { GlassmorphicPane } from "~/components/GlassmorphicPane/GlassmorphicPane";
import { Input } from "~/components/Input/Input";

export function NewEventAction() {
    const dialogRef = useRef<HTMLDialogElement | null>(null);
    const inputRef = useRef<HTMLInputElement | null>(null);

    const [, startTransition] = useTransition();

    const submitNewEvent = () => {
        if (!inputRef.current) {
            throw new Error("Ref not found");
        }
        if (!inputRef.current.value) {
            return;
        }

        startTransition(async () => {
            try {
                await AddEvent({ event_name: inputRef.current?.value });
            } catch (exception) {
                if (!(exception instanceof Error)) {
                    throw new Error("unexpected exception type");
                }
                throw exception;
            }
        });
    };

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
                    alt="add new entity icon"
                />
            </Button>
            <dialog ref={dialogRef} className="p-0 rounded-md">
                <GlassmorphicPane innerClassName="py-8 px-12">
                    <form
                        className="text-center"
                        method="dialog"
                        onSubmit={submitNewEvent}
                    >
                        <h2 className="text-xl mb-2">Create new event</h2>
                        <Input
                            ref={inputRef}
                            aria-label="new event name"
                            className="text-center my-6 py-2 mx-auto"
                            type="text"
                            placeholder="event name"
                            name="event_name"
                            autoCorrect="off"
                            required
                            maxLength={20}
                            onFocus={(e) => e.target.select()}
                        />
                        <div className="flex justify-evenly gap-2">
                            <Button
                                aria-label="Close dialog"
                                type="reset"
                                theme="BASIC"
                                className="flex-1 py-2"
                                onClick={() => dialogRef.current?.close()}
                            >
                                <Image
                                    src={cancelIcon}
                                    className="cursor-pointer m-auto"
                                    width={24}
                                    height={24}
                                    alt="cancel icon"
                                />
                            </Button>
                            <Button
                                aria-label="Submit new event"
                                type="submit"
                                theme="SAVE"
                                className="flex-1 py-2"
                            >
                                <Image
                                    src={okIcon}
                                    className="cursor-pointer m-auto"
                                    width={24}
                                    height={24}
                                    alt="accept icon"
                                />
                            </Button>
                        </div>
                    </form>
                </GlassmorphicPane>
            </dialog>
        </>
    );
}
