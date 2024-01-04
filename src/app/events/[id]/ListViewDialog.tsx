import { forwardRef } from "react";
import { useParams } from "next/navigation";

import { useEvent } from "~/context/EventProvider";
import { ChoiceRow } from "./ChoiceRow";
import { ClosePaneButton } from "~/components/GlassmorphicPane/ClosePane";
import { GlassmorphicPane } from "~/components/GlassmorphicPane/GlassmorphicPane";
import { ReactProps } from "~/typescript";

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

        const { allChoices, users } = useEvent();

        const closeModal = () => {
            if (!ref?.current) {
                throw new Error("Ref not found");
            }

            ref.current.close();
        };

        return (
            <dialog
                ref={ref}
                className="p-0 rounded-md w-full open:animate-fade-in"
                open={false}
            >
                <GlassmorphicPane
                    outerClassName="md:max-w-3xl md:m-auto"
                    innerClassName="pt-4 pb-6 px-4 h-[calc(100dvh-8rem)]"
                >
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
                                                {users.map((username) => (
                                                    <th
                                                        scope="col"
                                                        key={username}
                                                        className="px-2 py-2 truncate"
                                                    >
                                                        {username}
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
