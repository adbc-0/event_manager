import { useState } from "react";
import { twMerge } from "tailwind-merge";
import { match } from "ts-pattern";

import { NewCyclicEvent } from "./NewCyclicEvent";
import { CyclicEventsList } from "./CyclicEventsList";
import Dialog from "~/components/Dialog/Dialog";

type Tab = "list" | "new";

const Tabs = {
    LIST: "list",
    NEW: "new",
} as const;

function capitalizeFirstLetter(string: string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

export function CyclicDialog() {
    const [tab, setTab] = useState<Tab>(Tabs.LIST);

    return (
        <>
            <div
                role="tablist"
                className="grid grid-cols-[1fr_4fr_4fr_1fr] justify-center items-center my-1 gap-2 px-2"
            >
                <button
                    type="button"
                    aria-selected={tab === Tabs.LIST}
                    role="tab"
                    className={twMerge(
                        "rounded-md grow basis-0 py-1 px-2 col-start-2 col-end-2",
                        tab === Tabs.LIST ? "bg-raised text-accent" : "",
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
                        "rounded-md grow basis-0 py-1 px-2 col-start-3 col-end-3",
                        tab === Tabs.NEW ? "bg-raised text-accent" : "",
                    )}
                    onClick={() => setTab(Tabs.NEW)}
                >
                    {capitalizeFirstLetter(Tabs.NEW)}
                </button>
                <Dialog.DialogCloseButton className="justify-self-end" />
            </div>
            <div className="flex flex-col h-full gap-4">
                <div role="tabpanel">
                    {match(tab)
                        .with(Tabs.NEW, () => <NewCyclicEvent />)
                        .with(Tabs.LIST, () => <CyclicEventsList />)
                        .exhaustive()}
                </div>
            </div>
        </>
    );
}
