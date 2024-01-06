export * from "./eventUtils";

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

// @will-be-deprecated @unused
export const groupBy = <T>(
    array: T[],
    predicate: (value: T, index: number, array: T[]) => string | number,
) =>
    array.reduce(
        (acc, value, index, array) => {
            (acc[predicate(value, index, array)] ||= []).push(value);
            return acc;
        },
        {} as { [key: string | number]: T[] },
    );

export function handleQueryError(
    error: Error,
    handlers?: Record<number, (error: ServerError) => void>,
) {
    if (!(error instanceof ServerError)) {
        throw new Error("unexpected fetch error format");
    }
    if (!handlers) {
        throw error;
    }
    if (!handlers[error.status]) {
        throw error;
    }
    handlers[error.status](error);
}

export class ServerError extends Error {
    status: number;

    constructor(message: string, status: number) {
        super(message); // 'Error' breaks prototype chain here
        this.name = "ServerError";
        this.status = status;
        Object.setPrototypeOf(this, new.target.prototype); // restore prototype chain
    }
}
