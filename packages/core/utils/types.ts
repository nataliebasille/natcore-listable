// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type NoInfer<T> = [T][T extends any ? 0 : never];