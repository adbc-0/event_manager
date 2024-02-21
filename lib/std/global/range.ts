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
