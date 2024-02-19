export * from "./eventTypes";
export * from "./queries";

export type Values<T> = T[keyof T];
export type Nullable<T> = T | null;
export type ReactProps = {
    children?: React.ReactNode;
};
export type HashId = string;
export type ID = number;
