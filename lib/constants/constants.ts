export const LocalStorageKeys = {
    EVENT_NAME: "event_user_name",
} as const;

// Event related constants
export const AvailabilityEnum = {
    MAYBE_AVAILABLE: "MAYBE_AVAILABLE",
    UNAVAILABLE: "UNAVAILABLE",
    AVAILABLE: "AVAILABLE",
} as const;
export type AvailabilityEnumType = keyof typeof AvailabilityEnum;
