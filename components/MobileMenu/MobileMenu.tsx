"use client";

import { useRef } from "react";
import Image from "next/image";

import loginIcon from "~/public/login.svg";

import { useAnonAuth } from "~/hooks/use-anon-auth";
import { Button } from "../Button/Button";
import { LoginDialog } from "../LoginDialog/LoginDialog";

export function MobileMenu() {
    const { username, logout } = useAnonAuth();

    const usernameDialogRef = useRef<HTMLDialogElement>(null);

    const openIdentityModal = () => {
        usernameDialogRef.current?.showModal();
    };

    if (username) {
        return (
            <div className="fixed bottom-0 w-full">
                <div className="flex w-full">
                    <Button
                        theme="BASIC"
                        className="grow py-3 m-2"
                        onClick={logout}
                    >
                        Logout
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="fixed bottom-0 w-full">
                <div className="flex w-full">
                    <Button
                        theme="BASIC"
                        className="grow py-3 m-2"
                        onClick={openIdentityModal}
                    >
                        <Image
                            src={loginIcon}
                            className="m-auto"
                            width={24}
                            height={24}
                            alt="login icon"
                        />
                    </Button>
                </div>
            </div>
            {/* DIALOGS */}
            <LoginDialog ref={usernameDialogRef} />
        </>
    );
}
