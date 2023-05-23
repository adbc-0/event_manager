export type Values<Object> = Object[keyof Object]
export type Nullable<T> = T | null
export type AtLeastOnePropertyOf<T> = { [K in keyof T]:
  { [L in K]: T[L] } &
  { [L in Exclude<keyof T, K>]?: T[L] }
}[keyof T];