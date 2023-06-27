import Image from "next/image";

import trashIcon from "~/public/trash.svg";
import listIcon from "~/public/list.svg";

import { EventCalendar } from "~/components/EventCalendar/EventCalendar";
import { Button } from "~/components/Button/Button";
import { ReactProps } from "~/typescript";

type CalendarTopIconsProps = ReactProps & {
    openViewListDialog(): void;
    openRemovalDialog(): void;
};

export function CalendarTopIcons({
    openRemovalDialog,
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
                        className="cursor-pointer m-auto"
                        width={24}
                        height={24}
                        alt="edit username"
                    />
                </Button>
                <Button
                    aria-label="remove event"
                    type="button"
                    theme="BASIC"
                    className="w-9 h-9"
                    onClick={openRemovalDialog}
                >
                    <Image
                        src={trashIcon}
                        className="cursor-pointer m-auto"
                        width={24}
                        height={24}
                        alt="edit username"
                    />
                </Button>
            </div>
            <EventCalendar />
        </div>
    );
}
