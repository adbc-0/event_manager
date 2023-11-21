import { AvailabilityEnumValues } from "~/constants";

export type AvailabilityChoices = {
    available: number[];
    unavailable: number[];
    maybe_available: number[];
};
export type AllUsersAvailabilityChoices = Record<string, AvailabilityChoices>;
export type EventResponse = {
    name: string;
    months: { time: string; usersChoices: AllUsersAvailabilityChoices }[];
};
export type CurrentDate = {
    readonly day: number;
    readonly month: number;
    readonly year: number;
};
export type AllAvailability = Record<
    string,
    Record<string, AvailabilityEnumValues>
>;
export type OwnAvailability = Record<string, AvailabilityEnumValues>;
