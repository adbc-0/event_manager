import { createContext, useContext, useMemo, useReducer, useState } from "react";
import { ReactProps } from "../../typescript";
import { getCurrentDate } from "~/utils/date";

const Availability = {
    MAYBE_AVAILABLE: 'MAYBE_AVAILABLE',
    NOT_AVAILABLE: 'NOT_AVAILABLE',
    AVAILABLE: 'AVAILABLE'
} as const;

type AvailabilityEnum = keyof typeof Availability;
type DayAvailability = {
    user: string;
    choice: string;
}
type EmptyDays = Record<number, DayAvailability[]>
type OwnAvailability = Record<string, AvailabilityEnum>
type AllAvailability = Record<string, { [k: string]: AvailabilityEnum }>;
type DayColorType = 'MY_AVAILABLE' | 'MAYBE_AVAILABLE' | 'NOT_AVAILABLE' | 'ALL_SELECTED' | 'DIFFERENT_MONTH' | 'TODAY' | 'UNSELECTED';
type EventState = {
    allChoices: AllAvailability;
    ownChoices: OwnAvailability;
    ownChoicesBackup: OwnAvailability;
}
type UsernameChangeRecalculateAction = {
    type: 'USER_CHANGE_RECALCULATION';
    payload: OwnAvailability;
}
type NextMonthAction = {
    type: 'NEXT_MONTH';
    payload: OwnAvailability;
}
type PrevMonthAction = {
    type: 'PREV_MONTH';
    payload: OwnAvailability;
}
type DaySelectAction = {
    type: 'DAY_SELECT';
    payload: OwnAvailability;
}
type ResetChoicesAction = {
    type: 'RESET_CHOICES';
    payload: OwnAvailability;
}
type OverwriteBackupAction = {
    type: 'OVERWRITE_BACKUP';
    payload: OwnAvailability;
}
type EventActions = UsernameChangeRecalculateAction
    | NextMonthAction
    | PrevMonthAction
    | DaySelectAction
    | ResetChoicesAction
    | OverwriteBackupAction
type Provider = EventState

const EventContext = createContext<Provider>({
    allChoices: {},
    ownChoices: {},
    ownChoicesBackup: {},
});

export function useEvent() {
    const event = useContext(EventContext);
    if (event) {
        throw new Error('wrap component with provider to access context');
    }

    return event;
}

const nilCalendarReducer: EventState = {
    allChoices: {},
    ownChoices: {},
    ownChoicesBackup: {},   
} as const;

function eventReducer(state: EventState, action: EventActions) {
    switch (action.type) {
        case 'USER_CHANGE_RECALCULATION':
            return state;
        default:
            return state;
    }
}

export function EventProvider({ children }: ReactProps) {
    const [calendarDate, setCalendarDate] = useState(getCurrentDate());
    const [parsedEventChoices, eventDispatch] = useReducer(eventReducer, nilCalendarReducer);

    const providerValue = useMemo(() => ({
        ...parsedEventChoices,
    }), []);

    // current calendar date
    // current state
    return (
        <EventContext.Provider value={providerValue}>
            {children}
        </EventContext.Provider>
    )
}

