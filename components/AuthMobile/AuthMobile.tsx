"use client";

import Image from "next/image";
import { useParams } from "next/navigation";

import loginIcon from "~/public/login.svg";
import logoutIcon from "~/public/logout.svg";

import { useAnonAuth } from "~/hooks/use-anon-auth";
import { Button } from "~/components/Button/Button";
import { AuthDialogContent } from "~/components/AuthDialogContent/AuthDialogContent";
import Dialog from "../Dialog/Dialog";
import { EventRouteParams } from "~/typescript";

const mobileMenuLayoutStyle =
    "fixed bottom-0 w-full md:max-w-xl md:left-1/2 md:transform md:translate-x-[-50%]";

export function AuthMobile() {
    const { id: eventId } = useParams<EventRouteParams>();

    const { userId, username, logout } = useAnonAuth(eventId);

    if (userId) {
        return (
            <div className={mobileMenuLayoutStyle}>
                <div className="flex w-full gap-2 p-2">
                    <p className="basis-10/12 py-3 text-center bg-primary-darker border border-primary-darker-border rounded-md shadow-inner">
                        {username}
                    </p>
                    <Button
                        theme="BASIC"
                        className="basis-2/12 py-3"
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
        <>
            <div className={mobileMenuLayoutStyle}>
                <div className="flex w-full">
                    <Dialog>
                        <Dialog.DialogTrigger>
                            <Button theme="BASIC" className="grow py-3 m-2">
                                <Image
                                    src={loginIcon}
                                    className="m-auto"
                                    width={24}
                                    height={24}
                                    alt="login icon"
                                />
                            </Button>
                        </Dialog.DialogTrigger>
                        <Dialog.DialogContent title="User selection">
                            <AuthDialogContent />
                        </Dialog.DialogContent>
                    </Dialog>
                </div>
            </div>
        </>
    );
}
