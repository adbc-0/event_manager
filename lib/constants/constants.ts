export const LocalStorageKeys = {
    EVENT_NAME: "event_user_name",
} as const;
export const AvailabilityEnum = {
    MAYBE_AVAILABLE: "maybe_available",
    UNAVAILABLE: "unavailable",
    AVAILABLE: "available",
} as const;
export const FreqEnum = {
    WEEKLY: "WEEKLY",
} as const;
export const MILLISECONDS_IN_WEEK = 604_800_000;
export const DAYS_IN_WEEK = 7;
export const QUERY_STALE_TIME = 60_000;
export const CALENDAR_REFETCH_INTERVAL = 120_000;
export const WeekdaysList = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
] as const;
