export const LocalStorageKeys = {
    EVENT_NAME: "event_user_name",
} as const;

// Event related constants
export const AvailabilityEnum = {
    MAYBE_AVAILABLE: "maybe_available",
    UNAVAILABLE: "unavailable",
    AVAILABLE: "available",
} as const;
export type AvailabilityEnumValues =
    (typeof AvailabilityEnum)[keyof typeof AvailabilityEnum];
export const EventActionEnum = {
    CYCLE_VIEW_MODE: "CYCLE_VIEW_MODE",
    RESET_CHOICES: "RESET_CHOICES",
    LOAD_CHOICES: "SET_CHOICES",
    DAY_SELECT: "DAY_SELECT",
    USER_CHANGE: "USER_CHANGE",
    SUBMIT_CLEANUP: "SUBMIT_CLEANUP",
} as const;
export const ViewModes = {
    DAY: "day",
    CHOICES: "choices",
} as const;
export type ViewModesEnumValues = (typeof ViewModes)[keyof typeof ViewModes];
