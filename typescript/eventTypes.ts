import { AvailabilityEnumValues, FreqEnumValues } from "~/constants";

export type AvailabilityChoices = {
    available: number[];
    unavailable: number[];
    maybe_available: number[];
};
export type AllUsersAvailabilityChoices = Record<string, AvailabilityChoices>;
export type EventResponse = {
    name: string;
    time: string;
    groupedChoices: AllUsersAvailabilityChoices;
};
export type CurrentDate = {
    readonly day: number;
    readonly month: number;
    readonly year: number;
};
export type OwnAvailability = Record<string, AvailabilityEnumValues>;
export type RRule = {
    freq: FreqEnumValues;
    interval: number;
    byDay: string[];
};
export type ParsedRule = {
    FREQ: string;
    BYDAY: string;
    INTERVAL: string;
    COUNT: string;
};
export type EventRouteParams = {
    id: string;
};
