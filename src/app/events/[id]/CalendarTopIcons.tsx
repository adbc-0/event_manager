import Image from "next/image";
import { twMerge } from "tailwind-merge";
import { useParams } from "next/navigation";

import eventRepeatIcon from "~/public/event_repeat.svg";
import listIcon from "~/public/list.svg";
import changeViewMode from "~/public/changeViewMode.svg";
import changeViewModeNegative from "~/public/changeViewModeNegative.svg";

import { EventActionEnum, ViewModes, ViewModesEnumValues } from "~/constants";
import { useEvent } from "~/context/EventProvider";
import { useAnonAuth } from "~/hooks/use-anon-auth";
import { Button } from "~/components/Button/Button";
import { EventRouteParams, ReactProps } from "~/typescript";

type CalendarTopIconsProps = ReactProps & {
    openViewListDialog(): void;
    openCyclickDialog(): void;
};
const viewModeStyles: Record<ViewModesEnumValues, string> = {
    choices: "bg-white",
    day: "bg-neutral-700",
} as const;

export function CalendarTopIcons({
    openCyclickDialog,
    openViewListDialog,
}: CalendarTopIconsProps) {
    const { id: eventId } = useParams<EventRouteParams>();
    const { userId } = useAnonAuth(eventId);
    const { viewMode, eventDispatch } = useEvent();

    const toggleViewMode = () => {
        eventDispatch({ type: EventActionEnum.CYCLE_VIEW_MODE });
    };

    return (
        <div className="flex max-w-sm m-auto justify-end gap-1">
            <Button
                aria-label="show list view of events"
                type="button"
                theme="BASIC"
                className={twMerge("w-9 h-9", viewModeStyles[viewMode])}
                onClick={toggleViewMode}
            >
                <Image
                    src={
                        viewMode === ViewModes.DAY
                            ? changeViewMode
                            : changeViewModeNegative
                    }
                    className="m-auto"
                    width={24}
                    height={24}
                    alt="list icon"
                />
            </Button>
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
