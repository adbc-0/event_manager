import Image from "next/image";
import { forwardRef, useMemo } from "react";
import { useParams } from "next/navigation";

import closeIcon from "~/public/close.svg";
import checkCircleIcon from "~/public/check_circle.svg";
import deleteCircleIcon from "~/public/delete_circle.svg";
import questionCircleIcon from "~/public/question_cricle.svg";

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

        const availabilityColor = {
            available: "bg-green-600 backdrop-filter bg-opacity-10",
            maybe_available: "bg-orange-600 backdrop-filter bg-opacity-10",
            unavailable: "bg-red-600 backdrop-filter bg-opacity-10",
        };

        return (
            <dialog ref={ref} className="p-0 rounded-md w-full" open={false}>
                <GlassmorphicPane innerClassName="py-6 px-4">
                    <div className="flex flex-col">
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
                                    className="cursor-pointer m-auto"
                                    width={24}
                                    height={24}
                                    alt="close modal icon"
                                />
                            </Button>
                        </div>
                        <div className="relative basis-96">
                            <div className="absolute overflow-auto inset-0 shadow-md rounded-lg">
                                <table className="table-fixed w-full text-center text-sm text-gray-300 border-separate">
                                    <thead className="text-xs uppercase text-gray-300 h-10 bg-gray-900 backdrop-filter bg-opacity-30">
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
                                                <tr
                                                    key={day}
                                                    className="bg-gray-300 backdrop-filter bg-opacity-10"
                                                >
                                                    <th
                                                        scope="row"
                                                        className="px-2 py-2 font-medium text-gray-300"
                                                    >
                                                        {day}
                                                    </th>
                                                    {users.map((user) => (
                                                        <td
                                                            key={day + user}
                                                            className={`px-2 py-2 ${
                                                                availabilityColor[
                                                                    dayChoices[
                                                                        user
                                                                    ]
                                                                ]
                                                            }`}
                                                        >
                                                            {dayChoices[
                                                                user
                                                            ] ? (
                                                                <Image
                                                                    src={
                                                                        dayChoices[
                                                                            user
                                                                        ] ===
                                                                        "available"
                                                                            ? checkCircleIcon
                                                                            : dayChoices[
                                                                                  user
                                                                              ] ===
                                                                              "maybe_available"
                                                                            ? questionCircleIcon
                                                                            : deleteCircleIcon
                                                                    }
                                                                    className="m-auto"
                                                                    width={24}
                                                                    height={24}
                                                                    alt="close modal icon"
                                                                />
                                                            ) : null}
                                                        </td>
                                                    ))}
                                                </tr>
                                            ),
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </GlassmorphicPane>
            </dialog>
        );
    },
);
