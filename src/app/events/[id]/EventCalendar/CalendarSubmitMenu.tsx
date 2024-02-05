import { startTransition } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { useAtom } from "jotai";
import { useQueryClient } from "@tanstack/react-query";

import okIcon from "~/public/acceptButton.svg";
import cancelIcon from "~/public/rejectButton.svg";

import { calendarDateAtoms } from "~/atoms";
import { useAnonAuth } from "~/hooks/use-anon-auth";
import { calendarKeys, useEventQuery } from "~/queries/useEventQuery";
import { ChangeAvailability } from "~/app/api/events/[eventId]/actions";
import { Button } from "~/components/Button/Button";
import { ReactProps, EventRouteParams, OwnAvailability } from "~/typescript";

type CalendarControlProps = ReactProps & {
    ownChoices: OwnAvailability | null;
    resetCalendar: () => void;
    markChangesAsCurrent: () => void;
};

export function CalendarSubmitMenu({
    ownChoices,
    resetCalendar,
    markChangesAsCurrent,
}: CalendarControlProps) {
    const { id: eventId } = useParams<EventRouteParams>();
    const { userId, username } = useAnonAuth(eventId);
    if (!eventId) {
        throw new Error("Missing event url param");
    }

    const queryClient = useQueryClient();
    const [calendarDate] = useAtom(calendarDateAtoms.readDateAtom);
    const { data: event } = useEventQuery(eventId);

    if (!event) {
        return null;
    }

    const onSubmitClick = () => {
        if (Array.isArray(eventId)) {
            throw new Error("Unexpected catch all segments");
        }
        if (!username) {
            throw new Error("Missing username");
        }
        if (!ownChoices) {
            throw new Error("no choices to sumit");
        }

        const payload = {
            choices: ownChoices,
            date: calendarDate,
            eventId,
        };

        startTransition(() => {
            ChangeAvailability({ ...payload, userId });
            markChangesAsCurrent();
        });

        // Temporary fix until I change implementation of API
        setTimeout(() => {
            queryClient.invalidateQueries({
                queryKey: calendarKeys.ofEventAndMonth(eventId, calendarDate),
            });
        }, 100);
    };

    return (
        <div className="flex self-start md:w-128 md:justify-self-center gap-4 mx-1 mt-3">
            <Button
                aria-label="Revert choices"
                className="flex-auto py-2"
                theme="BASIC"
                type="reset"
                onClick={resetCalendar}
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
