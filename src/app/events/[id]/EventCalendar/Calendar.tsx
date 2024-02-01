import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useAtom } from "jotai";
import { match } from "ts-pattern";

import { AvailabilityEnum } from "~/constants";
import {
    parseEventToCalendarChoices,
    parseEventToOwnChoices,
} from "~/utils/eventUtils";
import { calendarDateAtoms } from "~/atoms";
import { useEventQuery } from "~/queries/useEventQuery";
import { useAnonAuth } from "~/hooks/use-anon-auth";
import { CalendarTopIcons } from "./CalendarTopIcons";
import { CalendarSubmitMenu } from "./CalendarSubmitMenu";
import { EventCalendar } from "./EventCalendar";
import {
    AllAvailability,
    AvailabilityEnumValues,
    EventRouteParams,
    OwnAvailability,
} from "~/typescript";

function getNextAvailabilityChoice(currentChoice: AvailabilityEnumValues) {
    return match(currentChoice)
        .with(
            AvailabilityEnum.AVAILABLE,
            () => AvailabilityEnum.MAYBE_AVAILABLE,
        )
        .with(
            AvailabilityEnum.MAYBE_AVAILABLE,
            () => AvailabilityEnum.UNAVAILABLE,
        )
        .otherwise(() => AvailabilityEnum.AVAILABLE);
}

export function Calendar() {
    const { id: eventId } = useParams<EventRouteParams>();
    const { username, userObserver } = useAnonAuth(eventId);
    if (!eventId) {
        throw new Error("Missing event url param");
    }

    const [areUnsubmitedChanges, setAreUnsubmitedChanges] = useState(false);
    const [allChoices, setAllChoices] = useState<AllAvailability | null>(null);
    const [ownChoices, setOwnChoices] = useState<OwnAvailability | null>(null);

    const [calendarDate] = useAtom(calendarDateAtoms.readDateAtom);
    const { data: event } = useEventQuery(eventId);

    useEffect(() => {
        const resetChoicesOnUserChange = () => {
            setAllChoices(null);
            setOwnChoices(null);
            setAreUnsubmitedChanges(false);
        };
        userObserver.subscribe(resetChoicesOnUserChange);
        return () => userObserver.unsubscribe(resetChoicesOnUserChange);
    }, [userObserver]);

    const resetUnsavedChoices = () => {
        if (!username) {
            throw new Error("null exception: username");
        }
        if (!event) {
            return;
        }
        const parsedOwnChoices = parseEventToOwnChoices(
            event.usersChoices[username],
            calendarDate,
        );
        const parsedAllChoices = parseEventToCalendarChoices(
            event.usersChoices,
            calendarDate,
        );
        setAllChoices(parsedAllChoices);
        setOwnChoices(parsedOwnChoices);
        setAreUnsubmitedChanges(false);
    };
    const selectDay = (selectedDay: number) => {
        if (!username) {
            throw new Error("null exception: username");
        }
        if (!event) {
            throw new Error("null exception: event");
        }

        const nonNullOwnChoices =
            ownChoices ??
            parseEventToOwnChoices(event.usersChoices[username], calendarDate);
        const nonNullAllChoices =
            allChoices ??
            parseEventToCalendarChoices(event.usersChoices, calendarDate);

        const ownChoicesClone = structuredClone(nonNullOwnChoices);
        const allChoicesClone = structuredClone(nonNullAllChoices);

        const currentChoice = nonNullOwnChoices[selectedDay];
        const nextChoice = getNextAvailabilityChoice(currentChoice);

        ownChoicesClone[selectedDay] = nextChoice;
        allChoicesClone[selectedDay][username] = nextChoice;

        setAllChoices(allChoicesClone);
        setOwnChoices(ownChoicesClone);
        setAreUnsubmitedChanges(true);
    };
    const markChangesAsCurrent = () => {
        setAreUnsubmitedChanges(false);
    };
    const cleanUpChoices = () => {
        setAllChoices(null);
        setOwnChoices(null);
        setAreUnsubmitedChanges(false);
    };

    return (
        <>
            <div className="mx-2">
                <CalendarTopIcons />
                <EventCalendar
                    clientAllChoices={allChoices}
                    clientOwnChoices={ownChoices}
                    selectDay={selectDay}
                    resetChoices={cleanUpChoices}
                />
            </div>
            {areUnsubmitedChanges && (
                <CalendarSubmitMenu
                    ownChoices={ownChoices}
                    resetCalendar={resetUnsavedChoices}
                    markChangesAsCurrent={markChangesAsCurrent}
                />
            )}
        </>
    );
}
