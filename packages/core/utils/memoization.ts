import { NoInfer } from "./types";

export type Memoizer<T> = () => T;

type UnwrapMemoizer<T> = T extends Memoizer<infer U> ? U : T;

type UnwrapDeps<TDeps extends readonly any[]> = TDeps extends []
  ? []
  : TDeps extends [infer Head, ...infer Tail]
  ? [UnwrapMemoizer<Head>, ...UnwrapDeps<Tail>]
  : [];

export function memoize<TDeps extends any[], TResult>(
  deps: () => readonly [...TDeps],
  fn: (...args: NoInfer<[...UnwrapDeps<TDeps>]>) => TResult
): Memoizer<TResult> {
  let previousDeps: UnwrapDeps<readonly [...TDeps]> | undefined = undefined;
  let value: TResult;
  const memoizer = () => {
    const newDeps = reevaluteDeps(deps);

    const isDifferent = !areDepsTheSame(previousDeps, newDeps);

    if (isDifferent) {
      previousDeps = newDeps;
      value = fn(...newDeps);
    }

    return value;
  };

  (memoizer as any).__memoized__ = true;
  return memoizer;
}

function isMemoizedDep(dep: any): dep is Memoizer<unknown> {
  return dep?.__memoized__ === true;
}

function reevaluteDeps<TDeps extends readonly any[]>(
  deps: () => TDeps
): UnwrapDeps<TDeps> {
  return deps().map((dep) => {
    if (isMemoizedDep(dep)) {
      return dep();
    }

    return dep;
  }) as UnwrapDeps<TDeps>;
}

function areDepsTheSame(
  previousDeps: ReadonlyArray<any> | undefined,
  newDeps: ReadonlyArray<any>
): boolean {
  if (previousDeps === undefined) {
    return false;
  }

  if (previousDeps.length !== newDeps.length) {
    return false;
  }

  return previousDeps.every((dep, index) => dep === newDeps[index]);
}
