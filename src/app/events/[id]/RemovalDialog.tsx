import { forwardRef } from "react";
import Image from "next/image";

import okIcon from "~/public/acceptRemovalButton.svg";
import cancelIcon from "~/public/rejectButton.svg";

import { Button } from "~/components/Button/Button";
import { GlassmorphicPane } from "~/components/GlassmorphicPane/GlassmorphicPane";
import { ReactProps } from "~/typescript";

type RemovalDialogProps = ReactProps;
type Ref = HTMLDialogElement;

export const RemovalDialog = forwardRef<Ref, RemovalDialogProps>(
    function RemovalDialog(_, ref) {
        if (typeof ref === "function") {
            throw new Error("Unexpected ref type");
        }

        const closeModal = () => {
            if (!ref?.current) {
                throw new Error("Ref not found");
            }

            ref.current.close();
        };

        return (
            <dialog ref={ref} className="p-0 rounded-md open:animate-fade-in">
                <GlassmorphicPane
                    outerClassName="max-w-sm"
                    innerClassName="py-6 px-4"
                >
                    <form className="text-center" method="dialog">
                        <h2 className="my-1">
                            Are you sure you want to remove this event?
                        </h2>
                        <p className="text-sm text-orange-400">
                            All data related to this event will be permamently
                            removed.
                        </p>
                        <div className="flex justify-evenly mt-6">
                            <Button
                                aria-label="Close dialog"
                                type="reset"
                                theme="BASIC"
                                className="flex-1 mx-2 py-2 "
                                onClick={closeModal}
                            >
                                <Image
                                    src={cancelIcon}
                                    className="cursor-pointer m-auto"
                                    width={24}
                                    height={24}
                                    alt="cancel icon"
                                />
                            </Button>
                            <Button
                                aria-label="Remove calendar"
                                type="submit"
                                theme="DISCARD"
                                className="flex-1 mx-2 py-2"
                            >
                                <Image
                                    src={okIcon}
                                    className="cursor-pointer m-auto"
                                    width={24}
                                    height={24}
                                    alt="accept icon"
                                />
                            </Button>
                        </div>
                    </form>
                </GlassmorphicPane>
            </dialog>
        );
    },
);
