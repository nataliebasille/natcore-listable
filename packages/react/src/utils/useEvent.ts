import { useCallback, useRef } from "react";

export function useEvent<TArgs extends unknown[], TResult>(
  callback: (...args: TArgs) => TResult
) {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  return useCallback((...args: TArgs) => callbackRef.current(...args), []);
}
