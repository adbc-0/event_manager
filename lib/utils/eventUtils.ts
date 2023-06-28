import { AllAvailability } from "../../typescript";

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
