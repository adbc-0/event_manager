import { forwardRef, useState } from "react";
import { twMerge } from "tailwind-merge";
import { match } from "ts-pattern";

import { GlassmorphicPane } from "~/components/GlassmorphicPane/GlassmorphicPane";
import { ClosePaneButton } from "~/components/GlassmorphicPane/ClosePane";
import { NewCyclicEvent } from "./NewCyclicEvent";
import { CyclicEventsList } from "./CyclicEventsList";
import { ReactProps } from "~/typescript";

type RemovalDialogProps = ReactProps;
type Ref = HTMLDialogElement;
type Tab = "list" | "new";

const Tabs = {
    LIST: "list",
    NEW: "new",
} as const;

const elementOnGlassBg =
    "bg-zinc-950 backdrop-filter backdrop-blur-3xl bg-opacity-30";

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
                    outerClassName="w-[90vw] md:max-w-xl"
                    innerClassName="pt-4 pb-6 px-4"
                >
                    <div className="flex flex-col h-full">
                        <ClosePaneButton closeModal={closeModal} />
                        <h2 className="mb-5 text-xl text text-center">
                            Cyclic Events
                        </h2>
                        <section className="p-1 rounded-md">
                            <div
                                role="tablist"
                                className={twMerge(
                                    "flex mb-1 border border-zinc-800",
                                    elementOnGlassBg,
                                )}
                            >
                                <button
                                    type="button"
                                    aria-selected={tab === Tabs.LIST}
                                    role="tab"
                                    className={twMerge(
                                        "grow basis-0 py-1 px-2",
                                        tab === Tabs.LIST
                                            ? "border-b-2 border-secondary text-secondary"
                                            : "",
                                    )}
                                    onClick={() => setTab(Tabs.LIST)}
                                >
                                    {capitalizeFirstLetter(Tabs.LIST)}
                                </button>
                                <button
                                    type="button"
                                    aria-selected={tab === Tabs.NEW}
                                    role="tab"
                                    className={twMerge(
                                        "grow basis-0 py-1 px-2",
                                        tab === Tabs.NEW
                                            ? "border-b-2 border-secondary text-secondary"
                                            : "",
                                    )}
                                    onClick={() => setTab(Tabs.NEW)}
                                >
                                    {capitalizeFirstLetter(Tabs.NEW)}
                                </button>
                            </div>
                            <div role="tabpanel" className={elementOnGlassBg}>
                                {match(tab)
                                    .with(Tabs.NEW, () => (
                                        <NewCyclicEvent
                                            closeDialog={closeModal}
                                        />
                                    ))
                                    .with(Tabs.LIST, () => <CyclicEventsList />)
                                    .exhaustive()}
                            </div>
                        </section>
                    </div>
                </GlassmorphicPane>
            </dialog>
        );
    },
);
