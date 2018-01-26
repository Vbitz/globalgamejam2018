export type Bag<T> = {
  [s: string]: T
};

export function randomId(): string {
  return (Math.random() * 100000000).toString(16);
}

export function expect(): never {
  throw new Error('Expect failed');
}

export function rand(max: number): number {
  return Math.floor(Math.random() * max);
}

export function randArray<T>(arr: T[]): T {
  return arr[rand(arr.length)];
}