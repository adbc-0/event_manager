"use client";

import Image from "next/image";
import { useParams } from "next/navigation";

import logoutIcon from "~/public/logout.svg";

import { useAnonAuth } from "~/hooks/use-anon-auth";
import { Button } from "~/components/Button/Button";
import { AuthDialogContent } from "~/components/AuthDialogContent/AuthDialogContent";
import Dialog from "../Dialog/Dialog";
import { EventRouteParams } from "~/typescript";

export function PersonPicker() {
    const { id: eventId } = useParams<EventRouteParams>();

    const { userId, username, logout } = useAnonAuth(eventId);

    if (userId) {
        return (
            <div className="mx-2">
                <div className="flex justify-center gap-2 max-w-sm mx-auto my-2">
                    <p className="grow px-6 py-3 text-center bg-primary-darker border border-primary-darker-border rounded-md shadow-inner">
                        {username}
                    </p>
                    <Button
                        theme="BASIC"
                        className="px-3 py-3"
                        onClick={logout}
                    >
                        <Image
                            src={logoutIcon}
                            className="m-auto"
                            width={24}
                            height={24}
                            alt="login icon"
                        />
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="mx-2">
            <div className="flex justify-center max-w-sm mx-auto">
                <Dialog>
                    <Dialog.DialogTrigger>
                        <Button theme="BASIC" className="grow px-3 py-3 my-2">
                            Pick Yourself
                        </Button>
                    </Dialog.DialogTrigger>
                    <Dialog.DialogContent title="Person selection">
                        <AuthDialogContent />
                    </Dialog.DialogContent>
                </Dialog>
            </div>
        </div>
    );
}
