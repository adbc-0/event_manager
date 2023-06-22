import {
    Dispatch,
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useReducer,
} from "react";
import { useRouter } from "next/navigation";

import {
    AvailabilityEnum,
    EventActionEnum,
} from "~/constants";
import {
    MonthDay,
    createMonthDays,
    eventDateToDate,
    getCurrentDate,
    getLastDayOfMonth,
    transformDayJsToCurrentDate,
} from "~/services/dayJsFacade";
import { ServerError, chunks } from "~/utils/index";
import { useAuth } from "~/hooks/use-auth";
import { decodeEventParamDate, encodeEventParamDate } from "~/utils/eventUtils";
import {
    AllAvailability,
    AllUsersAvailabilityChoices,
    AvailabilityChoices,
    CurrentDate,
    ErrorMessage,
    EventResponse,
    OwnAvailability,
    ReactProps,
} from "~/typescript";

type DayAvailability = {
    user: string;
    choice: string;
};
type EmptyDays = Record<number, DayAvailability[]>;
type EventBasicDetails = {
    name: string | null;
};
type MonthChunk = {
    key: number;
    chunk: MonthDay[];
};
type EventState = {
    isDirty: boolean;
    allChoices: AllAvailability;
    allChoicesBackup: AllAvailability;
    calendarDate: CurrentDate;
    event: EventBasicDetails;
    ownChoices: OwnAvailability;
    ownChoicesBackup: OwnAvailability;
};
type EventProviderReturn = EventState & {
    eventDispatch: Dispatch<EventActions>;
    getCurrentMonthInChunks: () => MonthChunk[];
};
type UsernameChangeRecalculateAction = {
    type: (typeof EventActionEnum)["USER_CHANGE"];
    payload: {
        username: string;
        allChoices: AllUsersAvailabilityChoices;
    };
};
type DaySelectAction = {
    type: (typeof EventActionEnum)["DAY_SELECT"];
    payload: {
        selectedDay: number;
        username: string | undefined;
    };
};
type ResetChoicesAction = {
    type: (typeof EventActionEnum)["RESET_CHOICES"];
};
type SetChoicesAction = {
    type: (typeof EventActionEnum)["LOAD_CHOICES"];
    payload: {
        event: EventResponse;
        username: string | undefined;
    };
};
type SubmitCleanupAction = {
    type: (typeof EventActionEnum)["SUBMIT_CLEANUP"];
}
type EventActions =
    | UsernameChangeRecalculateAction
    | DaySelectAction
    | ResetChoicesAction
    | SetChoicesAction
    | SubmitCleanupAction;
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
    isDirty: false,
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
    if (currentChoice === AvailabilityEnum.AVAILABLE) {
        return AvailabilityEnum.MAYBE_AVAILABLE;
    }

    if (currentChoice === AvailabilityEnum.MAYBE_AVAILABLE) {
        return AvailabilityEnum.UNAVAILABLE;
    }

    return AvailabilityEnum.AVAILABLE;
}

function createEmptyDays(daysInMonth = 0): EmptyDays {
    return Array.from<number>({ length: daysInMonth }).reduce(
        (acc, _, index) => ({ ...acc, [index + 1]: [] }),
        {},
    );
}

function searchChoicesForMatch(
    choices: AvailabilityChoices,
    condition: number,
) {
    if (choices.available.some((day) => condition === day)) {
        return AvailabilityEnum.AVAILABLE;
    }

    if (choices.maybe_available.some((day) => condition === day)) {
        return AvailabilityEnum.MAYBE_AVAILABLE;
    }

    if (choices.unavailable.some((day) => condition === day)) {
        return AvailabilityEnum.UNAVAILABLE;
    }

    return null;
}

// fixable with currying and checking before if choices exists
function parseOwnChoices(choices: AvailabilityChoices, maxMonthDay: number) {
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
        case EventActionEnum.USER_CHANGE: {
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
            clone.isDirty = false;

            return state;
        }
        case EventActionEnum.LOAD_CHOICES: {
            const clone = structuredClone(state);
            const { event, username } = action.payload;

            const eventParamDate = decodeEventParamDate(event.time);
            const dayJsDate = eventDateToDate(eventParamDate);
            const newCurrentDate = transformDayJsToCurrentDate(dayJsDate);
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
            clone.isDirty = false;

            return clone;
        }
        case EventActionEnum.DAY_SELECT: {
            const clone = structuredClone(state);
            const { selectedDay, username } = action.payload;
            if (!username) {
                throw new Error("cannot select the day without username");
            }

            const currentChoice = state.ownChoices[selectedDay];
            const nextChoice = getNextChoice(currentChoice);

            clone.ownChoices[selectedDay] = nextChoice;
            clone.allChoices[selectedDay][username] = nextChoice;
            clone.isDirty = true;

            return clone;
        }
        case EventActionEnum.RESET_CHOICES: {
            const clone = structuredClone(state);

            clone.allChoices = state.allChoicesBackup;
            clone.ownChoices = state.ownChoicesBackup;
            clone.isDirty = false;

            return clone;
        }
        case EventActionEnum.SUBMIT_CLEANUP: {
            const clone = structuredClone(state);

            clone.allChoicesBackup = state.allChoices;
            clone.ownChoicesBackup = state.ownChoices;
            clone.isDirty = false;

            return clone;
        }
        default:
            throw new Error("unhandled reducer action");
    }
}

export function EventProvider({ children, eventId }: EventProviderProps) {
    const { replace } = useRouter();
    const { username } = useAuth();
    const [eventControl, eventDispatch] = useReducer(
        eventReducer,
        nilCalendarReducer,
    );
    const { calendarDate } = eventControl;

    // ToDo: Runs one extra time because of changing username
    useEffect(() => {
        const abortController = new AbortController();

        async function initEventCalendar() {
            const { month, year } = getCurrentDate();
            const searchParams = new URLSearchParams({
                date: encodeEventParamDate(month, year),
            });

            try {
                const response = await fetch(
                    `/api/events/${eventId}?${searchParams.toString()}`,
                    {
                        signal: abortController.signal,
                    },
                );

                if (!response.ok) {
                    const error = (await response.json()) as ErrorMessage;
                    if (!error.message) {
                        throw new ServerError(
                            "error unhandled by server",
                            response.status,
                        );
                    }
                    throw new ServerError(error.message, response.status);
                }

                const event = (await response.json()) as EventResponse;

                eventDispatch({
                    type: EventActionEnum.LOAD_CHOICES,
                    payload: {
                        event,
                        username,
                    },
                });
            } catch (exception) {
                if (!(exception instanceof Error)) {
                    throw new Error("unexpected exception type");
                }
                if (exception.name === "AbortError") {
                    return;
                }
                if (exception instanceof ServerError) {
                    if (exception.status === 404) {
                        replace("/404");
                    }
                    throw exception;
                }
                throw exception;
            }
        }

        initEventCalendar();
        return () => {
            abortController.abort();
        };
    }, [eventId, username, replace]);

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
