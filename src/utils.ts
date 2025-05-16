export function last<T>(array: T[] | readonly T[]): T {
  if (array.length === 0) {
    throw new Error("Array is empty");
  }
  return array[array.length - 1];
}

/** 固定長配列に対する map 関数 */
export function map<T, U, A extends T[] | readonly T[] | [T]>(
  array: A,
  fn: (
    value: T,
    index: number,
    array: T[] | readonly T[] | [T],
    thisArg?: unknown,
  ) => U,
): { [K in keyof A]: U } {
  return array.map(fn) as { [K in keyof A]: U };
}
