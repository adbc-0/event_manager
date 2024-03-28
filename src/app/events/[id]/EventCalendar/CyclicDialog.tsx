import Image from "next/image";
import { useState } from "react";
import { match } from "ts-pattern";

import addIcon from "~/public/add.svg";

import { NewCyclicEvent } from "./NewCyclicEvent";
import { CyclicEventsList } from "./CyclicEventsList";
import Dialog from "~/components/Dialog/Dialog";
import { Button } from "~/components/Button/Button";

type Tab = "list" | "new";

const Tabs = {
    LIST: "list",
    NEW: "new",
} as const;

export function CyclicDialog() {
    const [tab, setTab] = useState<Tab>(Tabs.LIST);

    return (
        <>
            <div
                role="tablist"
                className="bg-headerbar-background grid grid-cols-[1fr_1fr_1fr] items-center py-2 gap-2 px-2"
            >
                {match(tab)
                    .with(Tabs.NEW, () => (
                        <>
                            <Button
                                variant="FLAT"
                                className="justify-self-start px-2"
                                onClick={() => setTab(Tabs.LIST)}
                            >
                                {"<"}
                            </Button>
                            <h2 className="text-center">New Event</h2>
                            <Dialog.DialogCloseButton className="justify-self-end" />
                        </>
                    ))
                    .with(Tabs.LIST, () => (
                        <>
                            <Button
                                className="justify-self-start"
                                variant="FLAT"
                                onClick={() => setTab(Tabs.NEW)}
                            >
                                <Image
                                    src={addIcon}
                                    className="m-auto"
                                    width={24}
                                    height={24}
                                    alt="Add new event"
                                />
                            </Button>
                            <h2 className="text-center">Events List</h2>
                            <Dialog.DialogCloseButton className="justify-self-end" />
                        </>
                    ))
                    .exhaustive()}
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
