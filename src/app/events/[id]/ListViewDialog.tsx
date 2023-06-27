import Image from "next/image";
import { forwardRef } from "react";
import { useParams } from "next/navigation";

import closeIcon from "~/public/close.svg";

import { useEvent } from "~/context/EventProvider";
import { Button } from "~/components/Button/Button";
import { GlassmorphicPane } from "~/components/GlassmorphicPane/GlassmorphicPane";
import { ReactProps } from "~/typescript";

type ListViewDialogProps = ReactProps;
type Ref = HTMLDialogElement;

// ToDo: Create normal table (y axis: days, x axis: users, cells: choices)
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

        return (
            <dialog ref={ref} className="p-0 rounded-md" open={false}>
                <GlassmorphicPane
                    outerClassName="max-w-sm"
                    innerClassName="py-6 px-4"
                >
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
                    <table className="table-fixed">
                        <thead>
                            <tr>
                                {/* get all unique users */}
                                <th>&nbsp;</th>
                                <th>orzel</th>
                                <th>1</th>
                                <th>2</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Object.entries(allChoices).map(
                                ([day, dayChoices]) => (
                                    <tr key={day}>
                                        <td>{day}</td>
                                        {/* print choices by users order in header */}
                                        {Object.entries(dayChoices).map(
                                            ([user, choice]) => (
                                                <td key={day + user}>
                                                    {choice}
                                                </td>
                                            ),
                                        )}
                                    </tr>
                                ),
                            )}
                        </tbody>
                    </table>
                </GlassmorphicPane>
            </dialog>
        );
    },
);
