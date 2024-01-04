export const LocalStorageKeys = {
    EVENT_NAME: "event_user_name",
} as const;
export const AvailabilityEnum = {
    MAYBE_AVAILABLE: "maybe_available",
    UNAVAILABLE: "unavailable",
    AVAILABLE: "available",
} as const;
export type AvailabilityEnumValues =
    (typeof AvailabilityEnum)[keyof typeof AvailabilityEnum];
export const EventActionEnum = {
    RESET_CHOICES: "RESET_CHOICES",
    LOAD_CHOICES: "SET_CHOICES",
    DAY_SELECT: "DAY_SELECT",
    USER_CHANGE: "USER_CHANGE",
    SUBMIT_CLEANUP: "SUBMIT_CLEANUP",
} as const;
export const FreqEnum = {
    WEEKLY: "WEEKLY",
} as const;
export type FreqEnumValues = (typeof FreqEnum)[keyof typeof FreqEnum];
export const MILLISECONDS_IN_WEEK = 604_800_000;
export const DAYS_IN_WEEK = 7;
