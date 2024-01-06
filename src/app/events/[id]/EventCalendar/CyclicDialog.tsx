import { useState } from "react";
import { twMerge } from "tailwind-merge";
import { match } from "ts-pattern";

import { NewCyclicEvent } from "./NewCyclicEvent";
import { CyclicEventsList } from "./CyclicEventsList";

type Tab = "list" | "new";

const Tabs = {
    LIST: "list",
    NEW: "new",
} as const;

const elementOnGlassBg = "bg-zinc-950 bg-opacity-30";

function capitalizeFirstLetter(string: string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

export function CyclicDialog() {
    const [tab, setTab] = useState<Tab>(Tabs.LIST);

    return (
        <div className="flex flex-col h-full gap-4">
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
                        .with(Tabs.NEW, () => <NewCyclicEvent />)
                        .with(Tabs.LIST, () => <CyclicEventsList />)
                        .exhaustive()}
                </div>
            </section>
        </div>
    );
}
