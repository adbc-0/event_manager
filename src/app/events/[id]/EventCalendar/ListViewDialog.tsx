import { useParams } from "next/navigation";
import { useAtom } from "jotai";

import { parseEventToCalendarChoices } from "~/utils/eventUtils";
import { calendarDateAtoms } from "~/atoms";
import { range } from "~/utils/index";
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

// ToDo: rewrite mutation
function filterOutPastDays(choices: AllAvailability) {
    const currentDay = getCurrentDate().day;
    const choicesClone = structuredClone(choices);
    range(2, currentDay, (i) => delete choicesClone[i-1]);
    return choicesClone;
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
        <table className="table-fixed w-full text-center text-sm text-gray-300 border-separate shadow-md">
            <thead className="sticky top-0 text-xs uppercase text-gray-300 h-10 bg-primary">
                <tr>
                    <th scope="col" className="px-2 py-2">
                        &nbsp;
                    </th>
                    {usernames.map((username) => (
                        <th
                            key={username}
                            scope="col"
                            className="px-2 py-2 truncate"
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
    );
}
