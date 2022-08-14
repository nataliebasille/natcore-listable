import {
  CategorizedListableParams,
  Category,
  create,
  Listable,
  ListableParams,
} from "@listable";
import { useEffect, useRef, useState } from "react";
import { useEvent } from "./utils/useEvent";

type ListableUpdaters<T> = (items: readonly T[]) => void;

const EMPTY_ARRAY: readonly unknown[] = [];

export function useListable<T>(
  initialItems: readonly T[] | (() => readonly T[]),
  options?: ListableParams<T>
): [readonly T[], ListableUpdaters<T>];
export function useListable<T>(
  initialItems: readonly T[] | (() => readonly T[]),
  options: CategorizedListableParams<T>
): [readonly Category<T>[], ListableUpdaters<T>];
export function useListable<T>(
  initialItems: readonly T[] | (() => readonly T[]),
  { search, rank, categorize }: Parameters<Listable<T>>[0] = {}
): [unknown, ListableUpdaters<T>] {
  const listableRef = useRef<Listable<T>>();

  if (!listableRef.current) {
    listableRef.current = create(
      typeof initialItems === "function" ? initialItems() : initialItems
    );
  }

  const [listableResult, setListableResult] = useState(
    () =>
      listableRef.current?.({
        search,
        rank,
        categorize,
      }) ?? EMPTY_ARRAY
  );

  const setItems = useEvent((items: readonly T[]) => {
    setListableResult(
      (listableRef.current = create(items))({
        search,
        rank,
        categorize,
      })
    );
  });

  useEffect(() => {
    setListableResult(
      listableRef.current?.({
        search,
        rank,
        categorize,
      }) ?? EMPTY_ARRAY
    );
  }, [categorize, rank, search]);

  return [listableResult, setItems];
}
