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
