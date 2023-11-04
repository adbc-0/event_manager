import { forwardRef, useState } from "react";
import Image from "next/image";
import { match } from "ts-pattern";

import cancelIcon from "~/public/rejectButton.svg";

import { Button } from "~/components/Button/Button";
import { GlassmorphicPane } from "~/components/GlassmorphicPane/GlassmorphicPane";
import { ReactProps } from "~/typescript";

type RemovalDialogProps = ReactProps;
type Ref = HTMLDialogElement;
type Tab = "list" | "new";

const Tabs = {
    LIST: "list",
    NEW: "new",
} as const;

function capitalizeFirstLetter(string: string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

export const CyclicDialog = forwardRef<Ref, RemovalDialogProps>(
    function CyclicDialog(_, ref) {
        const [tab, setTab] = useState<Tab>(Tabs.LIST);

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
                    <h2 className="mb-5 text-xl text text-center">
                        Cyclic Events
                    </h2>
                    <section>
                        <div
                            role="tablist"
                            className="flex mb-5 border-collapse"
                        >
                            <button
                                type="button"
                                aria-selected={tab === Tabs.LIST}
                                role="tab"
                                className="grow basis-0 py-1 px-2 border border-r-0 bg-neutral-700 border-zinc-900 aria-selected:bg-zinc-900 rounded-l-md      "
                                onClick={() => setTab(Tabs.LIST)}
                            >
                                {capitalizeFirstLetter(Tabs.LIST)}
                            </button>
                            <button
                                type="button"
                                aria-selected={tab === Tabs.NEW}
                                role="tab"
                                className="grow basis-0 py-1 px-2 border bg-neutral-700 border-zinc-900 aria-selected:bg-zinc-900 rounded-r-md"
                                onClick={() => setTab(Tabs.NEW)}
                            >
                                {capitalizeFirstLetter(Tabs.NEW)}
                            </button>
                        </div>
                        <div role="tabpanel">
                            {match(tab)
                                .with(Tabs.NEW, () => <div />)
                                .with(Tabs.LIST, () => <div />)
                                .exhaustive()}
                        </div>
                    </section>
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
