import { CategorizeFn, Category, SearchFn, SortFn } from "./types";
import { memoize } from "./utils";

export type ListableParams<T> = {
  search?: SearchFn<T>;
  rank?: SortFn<T>;
};

export type CategorizedListableParams<T> = ListableParams<T> & {
  categorize?: CategorizeFn<T>;
};

export type Listable<T> = {
  (options?: ListableParams<T>): readonly T[];
  (options: CategorizedListableParams<T>): readonly Category<T>[];
};

export function create<T>(items: readonly T[]): Listable<T> {
  const listable = [...items];

  let searchFn: SearchFn<T> | undefined = undefined;
  let rankFn: SortFn<T> | undefined = undefined;
  let categorizeFn: CategorizeFn<T> | undefined = undefined;

  const sortedItems = memoize(
    () => [listable, rankFn],
    (items, rank) => {
      const sorted = rank
        ? items.sort((a, b) => (rank?.(a) ?? 0) - (rank?.(b) ?? 0))
        : items;
      return sorted;
    }
  );

  const searchedItems = memoize(
    () => [sortedItems, searchFn],
    (items, search) => {
      const searched = search ? items.filter(search) : items;
      return searched;
    }
  );

  const categorizedItems = memoize(
    () => [searchedItems, categorizeFn],
    (items, categorize) => {
      if (!categorize) {
        return undefined;
      }

      const itemsCategorizedAndRanked = items
        .map((item) => {
          const categorized = categorizeFn?.(item) ?? "";
          return categorized instanceof Array
            ? ([item, ...categorized] as const)
            : ([item, categorized, Infinity] as const);
        })
        .sort(([, , rankA], [, , rankB]) => rankA - rankB);

      const categories = itemsCategorizedAndRanked.reduce(
        (categories, [item, categoryName]) => {
          if (!categories.has(categoryName)) {
            categories.set(categoryName, {
              name: categoryName,
              items: [],
            });
          }

          const category = categories.get(categoryName);

          (category?.items as T[]).push(item);

          return categories;
        },
        new Map<string, Category<T>>() as Map<string, Category<T>>
      );

      return [...categories.values()];
    }
  );

  const results = memoize(
    () => [searchedItems, categorizedItems],
    (items, categories) => {
      return categories ? categories : items;
    }
  );

  return (options = {}) => {
    searchFn = options.search;
    rankFn = options.rank;

    if ("categorize" in options) {
      categorizeFn = options.categorize;
    }

    return results() as any;
  };
}
