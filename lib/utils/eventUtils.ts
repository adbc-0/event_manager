import { AllAvailability, ParsedRule } from "../../typescript";

/** @description month index from 0 */
export function encodeEventParamDate(month: number, year: number) {
    return `${month}-${year}`;
}

export function validateEventParamDate(date: string) {
    const [month, year] = date.split("-");
    if (!month || Number.isNaN(month)) {
        return false;
    }
    if (!year || Number.isNaN(year)) {
        return false;
    }
    return true;
}

export function decodeEventParamDate(date: string) {
    const [month, year] = date.split("-");
    return [month, year] as const;
}

export function getUsersFromChoices(choices: AllAvailability) {
    return [
        ...new Set(Object.values(choices).flatMap((obj) => Object.keys(obj))),
    ];
}

// Example rule: FREQ=WEEKLY;INTERVAL=2;COUNT=8;WKST=SU;BYDAY=TU,TH
export function parseRule(rule: string): ParsedRule {
    const ruleEntries = rule.split(";").map((rulePair) => rulePair.split("="));
    return Object.fromEntries(ruleEntries) as ParsedRule;
}
