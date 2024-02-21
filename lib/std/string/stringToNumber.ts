export function stringToNumber(str: string) {
    const number = Number(str);
    if (Number.isNaN(number)) {
        throw new Error("Failed to convert string to number");
    }
    return number;
}
