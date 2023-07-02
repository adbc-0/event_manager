import Image from "next/image";
import { forwardRef, useMemo } from "react";
import { useParams } from "next/navigation";

import closeIcon from "~/public/close.svg";

import { useEvent } from "~/context/EventProvider";
import { Button } from "~/components/Button/Button";
import { GlassmorphicPane } from "~/components/GlassmorphicPane/GlassmorphicPane";
import { ReactProps } from "~/typescript";
import { getUsersFromChoices } from "~/utils/eventUtils";
import { ChoiceRow } from "./ChoiceRow";

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
                className="p-0 rounded-md w-full open:animate-fade-in"
                open={false}
            >
                <GlassmorphicPane innerClassName="py-6 px-4 h-96">
                    <div className="flex flex-col h-full">
                        <div className="flex justify-end mb-4">
                            <Button
                                aria-label="close list view button"
                                type="button"
                                theme="BASIC"
                                className="w-9 h-9 bg-transparent border-opacity-40"
                                onClick={closeModal}
                            >
                                <Image
                                    src={closeIcon}
                                    className="m-auto"
                                    width={24}
                                    height={24}
                                    alt="close modal icon"
                                />
                            </Button>
                        </div>
                        <div className="grow">
                            <div className="relative h-full">
                                <div className="absolute overflow-auto inset-0 shadow-md">
                                    <table className="table-fixed w-full text-center text-sm text-gray-300 border-separate">
                                        <thead className="sticky top-[-1px] text-xs uppercase text-gray-300 h-10 bg-zinc-800">
                                            <tr>
                                                <th
                                                    scope="col"
                                                    className="px-2 py-2"
                                                >
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
                                                    <ChoiceRow
                                                        key={day}
                                                        day={day}
                                                        dayChoices={dayChoices}
                                                        users={users}
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
