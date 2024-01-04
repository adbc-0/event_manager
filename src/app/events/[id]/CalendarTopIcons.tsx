import Image from "next/image";
import { useParams } from "next/navigation";

import eventRepeatIcon from "~/public/event_repeat.svg";
import listIcon from "~/public/list.svg";

import { useAnonAuth } from "~/hooks/use-anon-auth";
import { Button } from "~/components/Button/Button";
import { EventRouteParams, ReactProps } from "~/typescript";

type CalendarTopIconsProps = ReactProps & {
    openViewListDialog(): void;
    openCyclickDialog(): void;
};

export function CalendarTopIcons({
    openCyclickDialog,
    openViewListDialog,
}: CalendarTopIconsProps) {
    const { id: eventId } = useParams<EventRouteParams>();
    const { userId } = useAnonAuth(eventId);

    return (
        <div className="flex max-w-sm m-auto justify-end gap-1">
            <Button
                aria-label="remove event"
                className="w-9 h-9"
                type="button"
                theme="BASIC"
                disabled={!userId}
                onClick={openCyclickDialog}
            >
                <Image
                    src={eventRepeatIcon}
                    className="m-auto"
                    width={24}
                    height={24}
                    alt="list icon"
                />
            </Button>
            <Button
                aria-label="show list view of events"
                type="button"
                theme="BASIC"
                className="w-9 h-9"
                onClick={openViewListDialog}
            >
                <Image
                    src={listIcon}
                    className="m-auto"
                    width={24}
                    height={24}
                    alt="list icon"
                />
            </Button>
        </div>
    );
}
