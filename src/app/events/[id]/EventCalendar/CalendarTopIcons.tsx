import Image from "next/image";
import { useParams } from "next/navigation";

import eventRepeatIcon from "~/public/event_repeat.svg";
import listIcon from "~/public/list.svg";

import { useAnonAuth } from "~/hooks/use-anon-auth";
import Dialog from "~/components/Dialog/Dialog";
import { Button } from "~/components/Button/Button";
import { CyclicDialog } from "./CyclicDialog";
import { ListViewDialog } from "./ListViewDialog";
import { EventRouteParams } from "~/typescript";

export function CalendarTopIcons() {
    const { id: eventId } = useParams<EventRouteParams>();
    const { userId } = useAnonAuth(eventId);

    return (
        <div className="flex max-w-sm m-auto justify-end gap-1">
            <Dialog>
                <Dialog.DialogTrigger>
                    <Button
                        aria-label="show dialog with rules"
                        className="w-9 h-9"
                        type="button"
                        variant="BASIC"
                        disabled={!userId}
                    >
                        <Image
                            src={eventRepeatIcon}
                            className="m-auto"
                            width={24}
                            height={24}
                            alt="calendar icon"
                        />
                    </Button>
                </Dialog.DialogTrigger>
                <Dialog.DialogContent>
                    <CyclicDialog />
                </Dialog.DialogContent>
            </Dialog>
            <Dialog>
                <Dialog.DialogTrigger>
                    <Button
                        aria-label="show all choices listed in dialog"
                        type="button"
                        variant="BASIC"
                        className="w-9 h-9"
                    >
                        <Image
                            src={listIcon}
                            className="m-auto"
                            width={24}
                            height={24}
                            alt="list icon"
                        />
                    </Button>
                </Dialog.DialogTrigger>
                <Dialog.DialogContent>
                    <Dialog.DialogTopBar />
                    <ListViewDialog />
                </Dialog.DialogContent>
            </Dialog>
        </div>
    );
}
