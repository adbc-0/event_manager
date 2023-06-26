import { startTransition } from "react";
import { useParams } from "next/navigation";

import { EventActionEnum } from "~/constants";
import { ChangeAvailability } from "~/api/events/[id]/actions";
import { useEvent } from "~/context/EventProvider";
import { useAuth } from "~/hooks/use-auth";
import { Button } from "~/components/Button/Button";

export function DialogControl() {
    const { id: eventId } = useParams();
    const { username } = useAuth();
    if (!eventId) {
        throw new Error("Missing event url param");
    }

    const { isDirty, ownChoices, calendarDate, eventDispatch } = useEvent();

    const onSubmitClick = () => {
        const payload = {
            choices: ownChoices,
            date: calendarDate,
            eventId,
        };

        startTransition(() => {
            ChangeAvailability({ ...payload, userName: username });
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
        <div className="flex self-start md:w-128 md:justify-self-center gap-4 mx-1">
            <Button
                className="flex-auto py-2"
                theme="DISCARD"
                type="reset"
                onClick={onResetClick}
            >
                Reset
            </Button>
            <Button
                className="flex-auto py-2"
                theme="SAVE"
                type="submit"
                onClick={onSubmitClick}
            >
                Submit
            </Button>
        </div>
    );
}
