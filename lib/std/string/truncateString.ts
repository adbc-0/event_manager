export function truncateString(cutAfter: number) {
    return function (string: string) {
        return string.substring(0, cutAfter);
    };
}
