import { startTransition } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";

import okIcon from "~/public/acceptButton.svg";
import cancelIcon from "~/public/rejectButton.svg";

import { EventActionEnum } from "~/constants";
import { ChangeAvailability } from "~/app/api/events/[eventId]/actions";
import { useEvent } from "~/context/EventProvider";
import { useAnonAuth } from "~/hooks/use-anon-auth";
import { Button } from "~/components/Button/Button";
import { EventRouteParams } from "../../../../typescript/eventTypes";

export function CalendarControl() {
    const { id: eventId } = useParams<EventRouteParams>();
    const { userId } = useAnonAuth(eventId);
    if (!eventId) {
        throw new Error("Missing event url param");
    }

    const { isDirty, ownChoices, calendarDate, eventDispatch } = useEvent();

    const onSubmitClick = () => {
        if (Array.isArray(eventId)) {
            throw new Error("Unexpected catch all segments");
        }

        const payload = {
            choices: ownChoices,
            date: calendarDate,
            eventId,
        };

        startTransition(() => {
            ChangeAvailability({ ...payload, userId });
            eventDispatch({ type: EventActionEnum.SUBMIT_CLEANUP });
        });
    };

    const onResetClick = () => {
        eventDispatch({ type: EventActionEnum.RESET_CHOICES });
    };

    if (!isDirty) {
        return null;
    }

    return (
        <div className="flex self-start md:w-128 md:justify-self-center gap-4 mx-1 mt-3">
            <Button
                aria-label="Revert choices"
                className="flex-auto py-2"
                theme="BASIC"
                type="reset"
                onClick={onResetClick}
            >
                <Image
                    src={cancelIcon}
                    className="m-auto"
                    width={24}
                    height={24}
                    alt="cancel icon"
                />
            </Button>
            <Button
                aria-label="Submit choices"
                className="flex-auto py-2"
                theme="SAVE"
                type="submit"
                onClick={onSubmitClick}
            >
                <Image
                    src={okIcon}
                    className="m-auto"
                    width={24}
                    height={24}
                    alt="accept icon"
                />
            </Button>
        </div>
    );
}
