import Image from "next/image";
import { forwardRef, useMemo } from "react";
import { useParams } from "next/navigation";

import closeIcon from "~/public/close.svg";

import { useEvent } from "~/context/EventProvider";
import { Button } from "~/components/Button/Button";
import { GlassmorphicPane } from "~/components/GlassmorphicPane/GlassmorphicPane";
import { ReactProps } from "~/typescript";
import { getUsersFromChoices } from "~/utils/eventUtils";

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

        const closeModal = () => {
            if (!ref?.current) {
                throw new Error("Ref not found");
            }

            ref.current.close();
        };

        const users = useMemo(
            () => getUsersFromChoices(allChoices),
            [allChoices],
        );

        return (
            <dialog
                ref={ref}
                className="p-0 rounded-md max-h-screen"
                open={false}
            >
                <GlassmorphicPane innerClassName="py-6 px-4">
                    <div className="flex justify-end mb-4">
                        <Button
                            aria-label="close list view button"
                            type="button"
                            theme="BASIC"
                            className="w-9 h-9"
                        >
                            <Image
                                src={closeIcon}
                                className="cursor-pointer m-auto"
                                width={24}
                                height={24}
                                alt="close modal icon"
                                onClick={closeModal}
                            />
                        </Button>
                    </div>
                    <div className="overflow-auto shadow-md sm:rounded-lg">
                        <table className="w-full text-sm text-left text-gray-400">
                            <thead className="text-xs uppercase bg-gray-700 text-gray-400">
                                <tr>
                                    <th scope="col" className="px-2 py-2">
                                        &nbsp;
                                    </th>
                                    {users.map((user) => (
                                        <th
                                            scope="col"
                                            key={user}
                                            className="px-2 py-2"
                                        >
                                            {user}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {Object.entries(allChoices).map(
                                    ([day, dayChoices]) => (
                                        <tr
                                            key={day}
                                            className="border-b bg-gray-800 border-gray-700"
                                        >
                                            <th
                                                scope="row"
                                                className="px-2 py-2 font-medium text-gray-400 whitespace-nowrap"
                                            >
                                                {day}
                                            </th>
                                            {users.map((user) => (
                                                <td
                                                    key={day + user}
                                                    className="px-2 py-2"
                                                >
                                                    {dayChoices[user]}
                                                </td>
                                            ))}
                                        </tr>
                                    ),
                                )}
                            </tbody>
                        </table>
                    </div>
                </GlassmorphicPane>
            </dialog>
        );
    },
);
