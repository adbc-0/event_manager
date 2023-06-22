import { AvailabilityEnumType } from "~/constants";

export type AvailabilityChoices = {
    available: number[];
    unavailable: number[];
    maybe_available: number[];
};
export type AllUsersAvailabilityChoices = {
    [key: string]: AvailabilityChoices;
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
export type AllAvailability = Record<
    string,
    { [k: string]: AvailabilityEnumType }
>;
export type OwnAvailability = Record<string, AvailabilityEnumType>;