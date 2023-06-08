export type Values<T> = T[keyof T];
export type Nullable<T> = T | null;
// export type AtLeastOnePropertyOf<T> = {
//     [K in keyof T]: { [L in K]: T[L] } & { [L in Exclude<keyof T, K>]?: T[L] };
// }[keyof T];
export type ReactProps = {
    children?: JSX.Element[] | JSX.Element | string;
};
export type Availability = {
    available: number[];
    notAvailable: number[];
    maybeAvailable: number[];
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
