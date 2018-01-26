export type Bag<T> = {
  [s: string]: T
};

export function randomId(): string {
  return (Math.random() * 100000000).toString(16);
}

export function expect(): never {
  throw new Error('Expect failed');
}