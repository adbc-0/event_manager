import { AvailabilityEnum, FreqEnum } from "~/constants";

export type FreqEnumValues = (typeof FreqEnum)[keyof typeof FreqEnum];
export type AvailabilityEnumValues =
    (typeof AvailabilityEnum)[keyof typeof AvailabilityEnum];
export type AvailabilityFromRule = {
    day: number;
    availability: AvailabilityEnumValues;
    ruleId: number;
    type: "FROM_RULE";
};
export type AvailabilityFromManual = {
    day: number;
    availability: AvailabilityEnumValues;
    type: "MANUAL";
};
export type AvailabilityChoice = AvailabilityFromRule | AvailabilityFromManual;
export type AvailabilityChoices = Array<AvailabilityChoice>;
export type UsersAvailabilityChoices = Record<string, AvailabilityChoices>;
export type EventResponse = {
    name: string;
    time: string;
    usersChoices: UsersAvailabilityChoices;
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
    FREQ: FreqEnumValues;
    BYDAY: string;
    INTERVAL: string;
    COUNT: string;
};
export type EventRouteParams = {
    id: string;
};
