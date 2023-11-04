import Image from "next/image";

import eventRepeatIcon from "~/public/event_repeat.svg";
import listIcon from "~/public/list.svg";

import { EventCalendar } from "~/components/EventCalendar/EventCalendar";
import { Button } from "~/components/Button/Button";
import { ReactProps } from "~/typescript";

type CalendarTopIconsProps = ReactProps & {
    openViewListDialog(): void;
    openCyclickDialog(): void;
};

// ToDo: Remove dialog icond should be conditional
export function CalendarTopIcons({
    openCyclickDialog,
    openViewListDialog,
}: CalendarTopIconsProps) {
    return (
        <div>
            <div className="flex max-w-sm m-auto justify-end gap-1">
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
                <Button
                    aria-label="remove event"
                    type="button"
                    theme="BASIC"
                    className="w-9 h-9"
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
            </div>
            <EventCalendar />
        </div>
    );
}
