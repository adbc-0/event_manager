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

export const EventActionEnum = {
    RESET_CHOICES: "RESET_CHOICES",
    OVERWRITE_BACKUP: "OVERWRITE_BACKUP",
    SET_CHOICES: "SET_CHOICES",
    DAY_SELECT: "DAY_SELECT",
    USER_CHANGE_RECALCULATION: "USER_CHANGE_RECALCULATION",
} as const;
