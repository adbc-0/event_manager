import { forwardRef, useEffect, useState } from "react";
import { useParams } from "next/navigation";

import { ServerError } from "~/utils/index";
import { useAnonAuth } from "~/hooks/use-anon-auth";
import {
    EventUser,
    RequestResponse,
} from "~/app/api/events/[eventId]/users/route";
import { GlassmorphicPane } from "~/components/GlassmorphicPane/GlassmorphicPane";
import { ClosePaneButton } from "../GlassmorphicPane/ClosePane";

import { ErrorMessage, EventRouteParams, ReactProps } from "~/typescript";

type UsernameDialogProps = ReactProps;
type Ref = HTMLDialogElement;

export const AuthDialog = forwardRef<Ref, UsernameDialogProps>(
    function AuthDialog(_, ref) {
        const { id: eventId } = useParams<EventRouteParams>();
        if (!eventId) {
            throw new Error("Missing event url param");
        }

        const { setUsername } = useAnonAuth(eventId);

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

        const selectUser = (user: EventUser) => {
            if (!ref?.current) {
                throw new Error("Ref not found");
            }

            setUsername(user);
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
                    innerClassName="pt-4 pb-6 px-4"
                >
                    <div className="flex flex-col h-full gap-4">
                        <div className="flex justify-between content-center items-center">
                            <h2 className="text-xl">Select User</h2>
                            <ClosePaneButton closeModal={closeIdentityModal} />
                        </div>
                        <div className="flex flex-col">
                            {eventUsers.map((user) => (
                                <button
                                    key={user.id}
                                    type="button"
                                    className="grow border border-zinc-900 border-b-0 last:border-b block py-2 bg-neutral-800 hover:bg-secondary hover:text-black hover:transition-colors ease-out duration-300"
                                    onClick={() => selectUser(user)}
                                >
                                    {user.username}
                                </button>
                            ))}
                        </div>
                    </div>
                </GlassmorphicPane>
            </dialog>
        );
    },
);
