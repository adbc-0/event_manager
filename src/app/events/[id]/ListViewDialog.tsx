import { forwardRef, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";

import { ServerError } from "~/utils/index";
import { getUsersFromChoices } from "~/utils/eventUtils";
import { useEvent } from "~/context/EventProvider";
import { ChoiceRow } from "./ChoiceRow";
import { ClosePaneButton } from "~/components/GlassmorphicPane/ClosePane";
import { GlassmorphicPane } from "~/components/GlassmorphicPane/GlassmorphicPane";
import { RequestResponse } from "~/app/api/events/[eventId]/users/route";
import { ErrorMessage, ReactProps } from "~/typescript";

type ListViewDialogProps = ReactProps;
type Ref = HTMLDialogElement;

export const ListViewDialog = forwardRef<Ref, ListViewDialogProps>(
    function ListViewDialog(_, ref) {
        if (typeof ref === "function") {
            throw new Error("Unexpected ref type");
        }

        const { id: eventId } = useParams();
        if (!eventId) {
            throw new Error("Missing event url param");
        }

        const { allChoices } = useEvent();

        const [eventUsers, setEventUsers] = useState<RequestResponse>([]);

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

        const closeModal = () => {
            if (!ref?.current) {
                throw new Error("Ref not found");
            }

            ref.current.close();
        };

        // ToDo: Maybe instead of passing userIds pass usernames? Translation won't be needed then
        const usersIds = useMemo(
            () => getUsersFromChoices(allChoices),
            [allChoices],
        );

        const changeUserIdToUserName = (userId: string) => {
            const foundUser = eventUsers.find(
                ({ id }) => id === Number.parseInt(userId),
            );
            return foundUser?.username ?? userId;
        };

        return (
            <dialog
                ref={ref}
                className="p-0 rounded-md w-full open:animate-fade-in"
                open={false}
            >
                <GlassmorphicPane innerClassName="pt-4 pb-6 px-4 h-[calc(100dvh-8rem)]">
                    <div className="flex flex-col h-full gap-2">
                        <ClosePaneButton closeModal={closeModal} />
                        <div className="grow">
                            <div className="relative h-full">
                                <div className="absolute overflow-auto inset-0 shadow-md">
                                    <table className="table-fixed w-full text-center text-sm text-gray-300 border-separate">
                                        <thead className="sticky text-xs uppercase text-gray-300 h-10 bg-zinc-800">
                                            <tr>
                                                <th
                                                    scope="col"
                                                    className="px-2 py-2"
                                                >
                                                    &nbsp;
                                                </th>
                                                {usersIds.map((userId) => (
                                                    <th
                                                        scope="col"
                                                        key={userId}
                                                        className="px-2 py-2"
                                                    >
                                                        {changeUserIdToUserName(
                                                            userId,
                                                        )}
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {Object.entries(allChoices).map(
                                                ([day, dayChoices]) => (
                                                    <ChoiceRow
                                                        key={day}
                                                        day={day}
                                                        dayChoices={dayChoices}
                                                        users={usersIds}
                                                    />
                                                ),
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </GlassmorphicPane>
            </dialog>
        );
    },
);
