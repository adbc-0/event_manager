import {
    Dispatch,
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useReducer,
} from "react";
import {
    AllUsersAvailabilityChoices,
    Availability,
    CurrentDate,
    EventResponse,
    ReactProps,
} from "../../typescript";
import {
    MonthDay,
    createMonthDays,
    getCurrentDate,
    getLastDayOfMonth,
    transformISO_8601ToCurrentDate,
} from "~/utils/date";
import { chunks } from "~/utils/utils";
import { useAuth } from "~/hooks/use-auth";

const Availability = {
    MAYBE_AVAILABLE: "MAYBE_AVAILABLE",
    NOT_AVAILABLE: "NOT_AVAILABLE",
    AVAILABLE: "AVAILABLE",
} as const;

type AvailabilityEnum = keyof typeof Availability;
type DayAvailability = {
    user: string;
    choice: string;
};
type EmptyDays = Record<number, DayAvailability[]>;
type OwnAvailability = Record<string, AvailabilityEnum>;
type AllAvailability = Record<string, { [k: string]: AvailabilityEnum }>;
type Event = {
    name: string | null;
};
type MonthChunk = {
    key: number;
    chunk: MonthDay[];
};
type EventState = {
    allChoices: AllAvailability;
    allChoicesBackup: AllAvailability;
    calendarDate: CurrentDate;
    event: Event;
    ownChoices: OwnAvailability;
    ownChoicesBackup: OwnAvailability;
};
type EventProviderReturn = EventState & {
    eventDispatch: Dispatch<EventActions>;
    getCurrentMonthInChunks: () => MonthChunk[];
};
type UsernameChangeRecalculateAction = {
    type: "USER_CHANGE_RECALCULATION";
    payload: {
        username: string;
        allChoices: AllUsersAvailabilityChoices;
    };
};
type ChangeDateAction = {
    type: "CHANGE_DATE";
    payload: CurrentDate;
};
type DaySelectAction = {
    type: "DAY_SELECT";
    payload: {
        selectedDay: number;
        username: string | undefined;
    };
};
type ResetChoicesAction = {
    type: "RESET_CHOICES";
};
type OverwriteBackupAction = {
    type: "OVERWRITE_BACKUP";
    payload: OwnAvailability;
};
type SetChoicesAction = {
    type: "SET_CHOICES";
    payload: {
        event: EventResponse;
        username: string | undefined;
    };
};
type EventActions =
    | UsernameChangeRecalculateAction
    | ChangeDateAction
    | DaySelectAction
    | ResetChoicesAction
    | OverwriteBackupAction
    | SetChoicesAction;
type EventProviderProps = ReactProps & {
    eventId: string;
};

const nilEvent = {
    name: null,
} as const;

const nilCalendarReducer: EventState = {
    allChoices: parseAllChoices({}, getLastDayOfMonth(getCurrentDate())),
    allChoicesBackup: {},
    calendarDate: getCurrentDate(),
    event: nilEvent,
    ownChoices: {},
    ownChoicesBackup: {},
} as const;

const EventContext = createContext<EventProviderReturn>({
    ...nilCalendarReducer,
    eventDispatch: () => {
        throw new Error("function was called before proper initialization");
    },
    getCurrentMonthInChunks: () => {
        throw new Error("function was called before proper initialization");
    },
});

export function useEvent() {
    const event = useContext(EventContext);
    if (!event) {
        throw new Error("wrap component with provider to access context");
    }

    return event;
}

function getNextChoice(currentChoice: string) {
    if (currentChoice === Availability.AVAILABLE) {
        return Availability.MAYBE_AVAILABLE;
    }

    if (currentChoice === Availability.MAYBE_AVAILABLE) {
        return Availability.NOT_AVAILABLE;
    }

    return Availability.AVAILABLE;
}

function createEmptyDays(daysInMonth = 0): EmptyDays {
    return Array.from<number>({ length: daysInMonth }).reduce(
        (acc, _, index) => ({ ...acc, [index + 1]: [] }),
        {},
    );
}

function searchChoicesForMatch(choices: Availability, condition: number) {
    if (choices.available.some((day) => condition === day)) {
        return Availability.AVAILABLE;
    }

    if (choices.maybeAvailable.some((day) => condition === day)) {
        return Availability.MAYBE_AVAILABLE;
    }

    if (choices.notAvailable.some((day) => condition === day)) {
        return Availability.NOT_AVAILABLE;
    }

    return null;
}

// fixable with currying and checking before if choices exists
function parseOwnChoices(choices: Availability, maxMonthDay: number) {
    if (!choices) {
        return {};
    }

    const emptyDays = createEmptyDays(maxMonthDay);
    return Object.keys(emptyDays).reduce((acc, curr) => {
        const type = searchChoicesForMatch(choices, Number.parseInt(curr));
        if (type) {
            acc[curr] = type;
        }
        return acc;
    }, {} as OwnAvailability);
}

function parseAllChoices(
    usersChoices: AllUsersAvailabilityChoices,
    maxMonthDay: number,
) {
    const choices: AllAvailability = {};
    const emptyDays = createEmptyDays(maxMonthDay);

    Object.keys(emptyDays).forEach((day) => {
        const usersDayChoices: OwnAvailability = {};
        Object.entries(usersChoices).forEach(([users, userChoices]) => {
            const type = searchChoicesForMatch(
                userChoices,
                Number.parseInt(day),
            );
            if (!type) {
                return;
            }
            usersDayChoices[users] = type;
        });
        choices[day] = usersDayChoices;
    });

    return choices;
}

function eventReducer(state: EventState, action: EventActions) {
    switch (action.type) {
        case "USER_CHANGE_RECALCULATION": {
            const clone = structuredClone(state);
            const maxMonthDay = getLastDayOfMonth(state.calendarDate);

            clone.allChoices = parseAllChoices(
                action.payload.allChoices,
                maxMonthDay,
            );
            clone.allChoicesBackup = parseAllChoices(
                action.payload.allChoices,
                maxMonthDay,
            );
            clone.ownChoices = parseOwnChoices(
                action.payload.allChoices["orzel"],
                maxMonthDay,
            );
            clone.ownChoicesBackup = parseOwnChoices(
                action.payload.allChoices["orzel"],
                maxMonthDay,
            );

            return state;
        }
        case "CHANGE_DATE": {
            const clone = structuredClone(state);

            clone.calendarDate = action.payload;

            return clone;
        }
        case "SET_CHOICES": {
            const clone = structuredClone(state);
            const { event, username } = action.payload;

            const newCurrentDate = transformISO_8601ToCurrentDate(event.time);
            const maxMonthDay = getLastDayOfMonth(newCurrentDate);

            clone.event.name = event.eventName;
            clone.calendarDate = newCurrentDate;
            clone.allChoices = parseAllChoices(event.users, maxMonthDay);
            clone.allChoicesBackup = parseAllChoices(event.users, maxMonthDay);
            clone.ownChoices = username
                ? parseOwnChoices(event.users[username], maxMonthDay)
                : {};
            clone.ownChoicesBackup = username
                ? parseOwnChoices(event.users[username], maxMonthDay)
                : {};

            return clone;
        }
        case "DAY_SELECT": {
            const clone = structuredClone(state);
            const { selectedDay, username } = action.payload;
            if (!username) {
                throw new Error("cannot select the day without username");
            }

            const currentChoice = state.ownChoices[selectedDay];
            const nextChoice = getNextChoice(currentChoice);

            clone.ownChoices[selectedDay] = nextChoice;
            clone.allChoices[selectedDay][username] = nextChoice;
            return clone;
        }
        case "OVERWRITE_BACKUP": {
            const clone = structuredClone(state);

            clone.allChoicesBackup = state.allChoices;
            clone.ownChoicesBackup = state.ownChoices;

            return clone;
        }
        case "RESET_CHOICES": {
            const clone = structuredClone(state);

            clone.allChoices = state.allChoicesBackup;
            clone.ownChoices = state.ownChoicesBackup;

            return clone;
        }
        default:
            throw new Error("unhandled reducer action");
    }
}

export function EventProvider({ children, eventId }: EventProviderProps) {
    const { username } = useAuth();
    const [eventControl, eventDispatch] = useReducer(
        eventReducer,
        nilCalendarReducer,
    );
    const { calendarDate } = eventControl;

    useEffect(() => {
        const abortController = new AbortController();

        async function initEventCalendar() {
            const { month, year } = getCurrentDate();
            const searchParams = new URLSearchParams({
                date: `${month}-${year}`,
            });

            try {
                const response = await fetch(
                    `/api/events/${eventId}?${searchParams.toString()}`,
                    {
                        signal: abortController.signal,
                    },
                );

                const [event] = (await response.json()) as EventResponse[];

                eventDispatch({
                    type: "SET_CHOICES",
                    payload: {
                        event,
                        username,
                    },
                });
            } catch (exception) {
                if (!(exception instanceof Error)) {
                    throw new Error("unexpected exception format");
                }
                if (exception.name === "AbortError") {
                    return;
                }
                throw exception;
            }
        }

        initEventCalendar();
        return () => {
            abortController.abort();
        };
    }, [eventId, username]);

    const getCurrentMonthInChunks = useCallback(() => {
        const monthDaysData = createMonthDays(calendarDate);
        return [...chunks(monthDaysData, 7)];
    }, [calendarDate]);

    const providerValue: EventProviderReturn = useMemo(
        () => ({
            ...eventControl,
            eventDispatch,
            getCurrentMonthInChunks,
        }),
        [eventControl, getCurrentMonthInChunks],
    );

    return (
        <EventContext.Provider value={providerValue}>
            {children}
        </EventContext.Provider>
    );
}
