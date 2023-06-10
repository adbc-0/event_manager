import { startTransition } from "react";
import { useParams } from "next/navigation";

import { changeAvailability } from "~/app/api/events/[id]/actions";
import { useEvent } from "../../../../lib/context/EventProvider";
import { Button } from "~/components/Button/Button";

export function DialogControl() {
    const { id: eventId } = useParams();
    if (!eventId) {
        throw new Error("Missing event url param");
    }

    const { isDirty, ownChoices, eventDispatch } = useEvent();

    const onSubmitClick = () => {
        startTransition(() => {
            changeAvailability(eventId, ownChoices);
        });
        // setIsDirty(false);
    };

    const onResetClick = () => {
        eventDispatch({ type: "RESET_CHOICES" });
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
