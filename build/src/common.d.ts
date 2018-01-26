export declare type Bag<T> = {
    [s: string]: T;
};
export declare function randomId(): string;
export declare function expect(): never;
export declare function rand(max: number): number;
export declare function randArray<T>(arr: T[]): T;
