import { forwardRef, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";

import cancelIcon from "~/public/rejectButton.svg";

import { ServerError } from "~/utils/index";
import { useAnonAuth } from "~/hooks/use-anon-auth";

import { GlassmorphicPane } from "~/components/GlassmorphicPane/GlassmorphicPane";
import { Button } from "../Button/Button";

import { ErrorMessage, ReactProps } from "~/typescript";
import { RequestResponse } from "~/app/api/events/[id]/users/route";

type UsernameDialogProps = ReactProps;
type Ref = HTMLDialogElement;

export const AuthDialog = forwardRef<Ref, UsernameDialogProps>(
    function AuthDialog(_, ref) {
        const { id: eventId } = useParams();
        if (!eventId) {
            throw new Error("Missing event url param");
        }

        const { setUsername } = useAnonAuth();

        const [eventUsers, setEventUsers] = useState<RequestResponse>([]);

        if (typeof ref === "function") {
            throw new Error("Unexpected ref type");
        }

        const closeIdentityModal = () => {
            if (!ref?.current) {
                throw new Error("Ref not found");
            }

            ref.current.close();
        };

        const selectUser = (username: string) => {
            if (!ref?.current) {
                throw new Error("Ref not found");
            }

            setUsername(username);
            ref.current.close();
        };

        useEffect(() => {
            async function fetchEventUsers() {
                const response = await fetch(`/api/events/${eventId}/users`);
                if (!response.ok) {
                    const error = (await response.json()) as ErrorMessage;
                    if (!error.message) {
                        throw new ServerError(
                            "error unhandled by server",
                            response.status,
                        );
                    }
                    throw new ServerError(error.message, response.status);
                }

                const users = (await response.json()) as RequestResponse;
                setEventUsers(users);
            }

            fetchEventUsers();
        }, [eventId]);

        return (
            <dialog
                ref={ref}
                className="p-0 w-full rounded-md open:animate-fade-in"
            >
                <GlassmorphicPane
                    outerClassName="max-w-sm m-auto"
                    innerClassName="py-6 px-4"
                >
                    <h2 className="text-xl mb-2 text-center">Select user</h2>
                    <div>
                        {eventUsers.map(({ username, id }) => (
                            <Button
                                key={id}
                                theme="BASIC"
                                type="button"
                                onClick={() => selectUser(username)}
                            >
                                {username}
                            </Button>
                        ))}
                    </div>
                    <div className="flex justify-evenly">
                        <Button
                            aria-label="Close dialog"
                            theme="BASIC"
                            className="flex-1 mx-2 py-2"
                            type="button"
                            onClick={closeIdentityModal}
                        >
                            <Image
                                src={cancelIcon}
                                className="m-auto"
                                width={24}
                                height={24}
                                alt="cancel icon"
                            />
                        </Button>
                    </div>
                </GlassmorphicPane>
            </dialog>
        );
    },
);
