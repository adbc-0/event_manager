export function* chunks<T>(
    arr: T[],
    n: number,
): Generator<{ key: number; chunk: T[] }, void> {
    for (let i = 0; i < arr.length; i += n) {
        yield { key: i, chunk: arr.slice(i, i + n) };
    }
}

export function range<T>(
    start: number,
    iterations: number,
    callback: (i: number) => T,
) {
    let i = 0;
    const arr: T[] = [];

    do {
        arr.push(callback(start + i));
        i++;
    } while (i < iterations);

    return arr;
}

export const pipe = <T extends unknown[], U>(
    fn1: (...args: T) => U,
    ...fns: Array<(a: U) => U>
) => {
    const piped = fns.reduce(
        (prevFn, nextFn) => (value: U) => nextFn(prevFn(value)),
        (value) => value,
    );
    return (...args: T) => piped(fn1(...args));
};

export function capitalize(string: string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

export function truncateString(cutAfter: number) {
    return function (string: string) {
        return string.substring(0, cutAfter);
    };
}
