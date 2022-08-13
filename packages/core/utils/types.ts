// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type NoInfer<T> = [T][T extends any ? 0 : never];
export type AnyFunction<TArgs extends any[], TResult> = (
  ...args: TArgs
) => TResult;
export type NonFunctionsOnly<T> = {
  [P in keyof T]: T[P] extends AnyFunction<any, any> ? never : T[P];
};
export type FunctionsOnly<T> = {
  [P in keyof T]: T[P] extends AnyFunction<any, any> ? T[P] : never;
};
