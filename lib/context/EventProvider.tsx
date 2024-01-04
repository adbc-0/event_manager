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
    AvailabilityEnumValues,
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
import { useAnonAuth } from "~/hooks/use-anon-auth";
import { useSsc } from "~/hooks/use-ssc";
import { decodeEventParamDate, encodeEventParamDate } from "~/utils/eventUtils";
import {
    AllUsersAvailabilityChoices,
    AvailabilityChoices,
    CurrentDate,
    ErrorMessage,
    EventResponse,
    OwnAvailability,
    ReactProps,
} from "~/typescript";

const nilEvent = {
    name: null,
} as const;

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
    allChoices: AllAvailability;
    allChoicesBackup: AllAvailability;
    calendarDate: CurrentDate;
    event: EventBasicDetails;
    isDirty: boolean;
    ownChoices: OwnAvailability;
    ownChoicesBackup: OwnAvailability;
    users: string[];
};
type EventProviderReturn = EventState & {
    eventDispatch: Dispatch<EventActions>;
    getCurrentMonthInChunks: () => MonthChunk[];
    fetchEventCalendar: (abortController?: AbortController) => Promise<void>;
};
type DaySelectAction = {
    type: (typeof EventActionEnum)["DAY_SELECT"];
    payload: {
        selectedDay: number;
        username?: string;
    };
};
type ResetChoicesAction = {
    type: (typeof EventActionEnum)["RESET_CHOICES"];
};
type SetChoicesAction = {
    type: (typeof EventActionEnum)["LOAD_CHOICES"];
    payload: {
        event: EventResponse;
        username?: string;
    };
};
type SubmitCleanupAction = {
    type: (typeof EventActionEnum)["SUBMIT_CLEANUP"];
};
type EventActions =
    | DaySelectAction
    | ResetChoicesAction
    | SetChoicesAction
    | SubmitCleanupAction;
type EventProviderProps = ReactProps & {
    eventId: string;
};
type AllAvailability = Record<string, Record<string, AvailabilityEnumValues>>;

const nilCalendarReducer: EventState = {
    allChoices: parseAllChoices({}, getLastDayOfMonth(getCurrentDate())),
    allChoicesBackup: {},
    calendarDate: getCurrentDate(),
    event: nilEvent,
    isDirty: false,
    ownChoices: {},
    ownChoicesBackup: {},
    users: [],
} as const;

const EventContext = createContext<EventProviderReturn>({
    ...nilCalendarReducer,
    eventDispatch() {
        throw new Error("function was called before proper initialization");
    },
    getCurrentMonthInChunks() {
        throw new Error("function was called before proper initialization");
    },
    fetchEventCalendar() {
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

// unavailable take precedence over maybe_available and available
function searchChoicesForMatch(
    choices: AvailabilityChoices,
    condition: number,
) {
    if (choices.unavailable.some((day) => condition === day)) {
        return AvailabilityEnum.UNAVAILABLE;
    }
    if (choices.maybe_available.some((day) => condition === day)) {
        return AvailabilityEnum.MAYBE_AVAILABLE;
    }
    if (choices.available.some((day) => condition === day)) {
        return AvailabilityEnum.AVAILABLE;
    }
    return null;
}

function parseOwnChoices(choices: AvailabilityChoices, maxMonthDay: number) {
    if (!choices) {
        return {};
    }

    const emptyDays = createEmptyDays(maxMonthDay);
    return Object.keys(emptyDays).reduce((o, day) => {
        const choice = searchChoicesForMatch(choices, Number.parseInt(day));
        if (choice) {
            o[day] = choice;
        }
        return o;
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
        case EventActionEnum.LOAD_CHOICES: {
            const clone = structuredClone(state);
            const { event, username } = action.payload;
            if (!event) {
                throw new Error("expected choices data for given month");
            }

            const eventParamDate = decodeEventParamDate(event.time);
            const dayJsDate = eventDateToDate(eventParamDate);
            const newCurrentDate = transformDayJsToCurrentDate(dayJsDate);
            const maxMonthDay = getLastDayOfMonth(newCurrentDate);
            const parsedAllChoices = parseAllChoices(
                event.groupedChoices,
                maxMonthDay,
            );
            const parsedOwnChoices = username
                ? parseOwnChoices(event.groupedChoices[username], maxMonthDay)
                : {};

            clone.event.name = event.name;
            clone.calendarDate = newCurrentDate;
            clone.allChoices = parsedAllChoices;
            clone.allChoicesBackup = structuredClone(parsedAllChoices);
            clone.ownChoices = parsedOwnChoices;
            clone.ownChoicesBackup = structuredClone(parsedOwnChoices);
            clone.isDirty = false;
            clone.users = Object.keys(event.groupedChoices);

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
    const { isServer } = useSsc();
    const { replace } = useRouter();
    const { username } = useAnonAuth(eventId);
    const [eventControl, eventDispatch] = useReducer(
        eventReducer,
        nilCalendarReducer,
    );
    const { calendarDate } = eventControl;

    const fetchEventCalendar = useCallback(
        async (abortController?: AbortController) => {
            const { month, year } = getCurrentDate();
            const searchParams = new URLSearchParams({
                date: encodeEventParamDate(month, year),
            });

            try {
                const fetchInit = abortController
                    ? {
                          signal: abortController.signal,
                      }
                    : {};
                const response = await fetch(
                    `/api/events/${eventId}?${searchParams.toString()}`,
                    fetchInit,
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
        },
        [eventId, replace, username],
    );

    useEffect(() => {
        if (isServer) {
            return; // So request won't run and be aborted
        }

        const abortController = new AbortController();
        fetchEventCalendar(abortController);

        return () => {
            abortController.abort();
        };
    }, [fetchEventCalendar, isServer]);

    const getCurrentMonthInChunks = useCallback(() => {
        const monthDaysData = createMonthDays(calendarDate);
        return [...chunks(monthDaysData, 7)];
    }, [calendarDate]);

    const providerValue: EventProviderReturn = useMemo(
        () => ({
            ...eventControl,
            eventDispatch,
            getCurrentMonthInChunks,
            fetchEventCalendar,
        }),
        [eventControl, getCurrentMonthInChunks, fetchEventCalendar],
    );

    return (
        <EventContext.Provider value={providerValue}>
            {children}
        </EventContext.Provider>
    );
}
