export function* chunks<T>(arr: T[], n: number): Generator<{ key: number, chunk: T[]}, void> {
  for (let i = 0; i < arr.length; i += n) {
      yield { key: i, chunk: arr.slice(i, i + n) };
  }
}

export function range<T>(start: number, iterations: number, callback: (i: number) => T) {
  let i = 0;
  const arr: T[] = [];

  do {
      arr.push(callback(start + i));
      i++;
  } while (i < iterations);

  return arr;
}
