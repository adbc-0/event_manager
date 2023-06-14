export type Values<T> = T[keyof T];
export type Nullable<T> = T | null;
export type ReactProps = {
    children?: JSX.Element[] | JSX.Element | string;
};
export type Availability = {
    available: number[];
    unavailable: number[];
    maybe_available: number[];
};
export type AllUsersAvailabilityChoices = {
    [key: string]: Availability;
};
export type EventResponse = {
    eventName: string;
    time: string;
    users: AllUsersAvailabilityChoices;
};
export type CurrentDate = {
    readonly day: number;
    readonly month: number;
    readonly year: number;
};
export type HashId = string;
