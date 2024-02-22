import { useParams } from "next/navigation";
import { useAtom } from "jotai";

import { stringToNumber } from "~/std";
import { parseEventToCalendarChoices } from "~/utils/eventUtils";
import { calendarDateAtoms } from "~/atoms";
import { getCurrentDate } from "~/services/dayJsFacade";
import {
    useEventUsersQuery,
    usernameSelector,
} from "~/queries/useEventUsersQuery";
import { useEventQuery } from "~/queries/useEventQuery";
import { ChoiceRow } from "./ChoiceRow";
import {
    AllAvailability,
    CurrentDate,
    EventRouteParams,
    UsersAvailabilityChoices,
} from "~/typescript";

function filterOutPastDays(choices: AllAvailability) {
    const currentDay = getCurrentDate().day;
    return Object.entries(choices).reduce((acc, [day, choices]) => {
        if (stringToNumber(day) < currentDay) {
            return acc;
        }
        acc[stringToNumber(day)] = choices;
        return acc;
    }, {} as AllAvailability);
}

function parseChoices(
    usersChoices: UsersAvailabilityChoices,
    eventDate: CurrentDate,
) {
    const currentDate = getCurrentDate();
    const fullMonthChoices = parseEventToCalendarChoices(
        usersChoices,
        eventDate,
    );
    if (currentDate.month === eventDate.month) {
        return filterOutPastDays(fullMonthChoices);
    }
    return fullMonthChoices;
}

export function ListViewDialog() {
    const { id: eventId } = useParams<EventRouteParams>();
    if (!eventId) {
        throw new Error("Missing event url param");
    }

    const [calendarDate] = useAtom(calendarDateAtoms.readDateAtom);
    const { data: event } = useEventQuery(eventId);
    const { data: usernames } = useEventUsersQuery(eventId, usernameSelector);
    if (!usernames || !event) {
        return null;
    }

    const availabilityChoices = parseChoices(event.usersChoices, calendarDate);

    return (
        <div className="overflow-y-auto overflow-x-hidden max-h-[calc(90vh-5.5rem)]">
            <table className="grid bg-primary-light">
                <thead className="sticky top-0 text-xs uppercase text-gray-300 bg-primary">
                    <tr className="grid auto-cols-fr grid-flow-col gap-1">
                        <th scope="col" className="p-2" />
                        {usernames.map((username) => (
                            <th
                                key={username}
                                scope="col"
                                className="truncate p-2"
                            >
                                {username}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {Object.entries(availabilityChoices).map(
                        ([day, dayChoices]) => (
                            <ChoiceRow
                                key={day}
                                day={day}
                                dayChoices={dayChoices}
                                users={usernames}
                            />
                        ),
                    )}
                </tbody>
            </table>
        </div>
    );
}
