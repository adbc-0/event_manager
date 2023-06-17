/** @description month index from 0 */
export function encodeEventParamDate(month: number, year: number) {
    return `${month}-${year}`;
}

export function validateEventParamDate(date: string) {
    const [month, year] = date.split("-");

    if (!month || Number.isNaN(month)) {
        throw new Error("Incorrect event date format");
    }
    if (!year || Number.isNaN(year)) {
        throw new Error("Incorrect event date format");
    }
}

export function decodeEventParamDate(date: string) {
    const [month, year] = date.split("-");
    return [month, year] as const;
}
