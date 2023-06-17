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
