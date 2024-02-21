export function* chunks<T>(
    arr: T[],
    n: number,
): Generator<{ key: number; chunk: T[] }, void> {
    for (let i = 0; i < arr.length; i += n) {
        yield { key: i, chunk: arr.slice(i, i + n) };
    }
}
