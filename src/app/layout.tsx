"use client";

import "./globals.css";
import { Fira_Sans_Condensed } from "next/font/google";
import Image from "next/image";

import loginIcon from "~/public/login.svg";

import { Button } from "~/components/Button/Button";
import { useRef } from "react";
import { LoginDialog } from "~/components/LoginDialog/LoginDialog";

const firaSans = Fira_Sans_Condensed({ weight: "400", subsets: ["latin"] });

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const usernameDialogRef = useRef<HTMLDialogElement>(null);

    const openIdentityModal = () => {
        usernameDialogRef.current?.showModal();
    };

    return (
        <html lang="en">
            <body className={`${firaSans.className} min-h-full-dvh`}>
                <main>{children}</main>
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
            </body>
        </html>
    );
}
