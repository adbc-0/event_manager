import { AvailabilityEnum, FreqEnum } from "~/constants";

type FreqEnumValues = (typeof FreqEnum)[keyof typeof FreqEnum];

export type AvailabilityEnumValues =
    (typeof AvailabilityEnum)[keyof typeof AvailabilityEnum];
export type AvailabilityChoices = {
    available: number[];
    unavailable: number[];
    maybe_available: number[];
};
export type UsersAvailabilityChoices = Record<string, AvailabilityChoices>;
export type EventResponse = {
    name: string;
    time: string;
    groupedChoices: UsersAvailabilityChoices;
};
export type CurrentDate = {
    readonly day: number;
    readonly month: number;
    readonly year: number;
};
export type OwnAvailability = Record<string, AvailabilityEnumValues>;
export type AllAvailability = Record<string, OwnAvailability>;
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
