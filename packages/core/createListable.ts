import type {
  CategorizedListable,
  CategorizeFn,
  Category,
  CreateListableOptions,
  Listable,
  SearchFn,
  SortFn,
} from "./types";
import { memoize } from "./utils/memoization";

export function createListable<T>(
  options?: Omit<CreateListableOptions<T>, "categorize">
): Listable<T>;
export function createListable<T>(
  options: CreateListableOptions<T> & { categorize: CategorizeFn<T> }
): CategorizedListable<T>;

export function createListable<T>(
  options: CreateListableOptions<T> = {}
): Listable<T> | CategorizedListable<T> {
  let { initialItems = [], search, categorize, rank } = options;

  const resultsMemo = memoize(
    () => [initialItems, search, rank],
    (items, searchFn, rankFn) => {
      const results = searchFn ? items.filter(searchFn) : (items as T[]);
      const sorted = rankFn
        ? results.sort((a, b) => rankFn(a) - rankFn(b))
        : results;
      return sorted;
    }
  );

  const categoriesMemo = memoize(
    () => [resultsMemo, categorize],
    (results, categorizeFn) => {
      if (!categorizeFn) {
        return undefined;
      }

      const itemsCategorizedAndRanked = results
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

  const data = memoize(
    () => [initialItems, resultsMemo, categoriesMemo],
    (items, results, categories) => {
      return {
        items,
        results,
        ...(categories ? { categories } : {}),
      };
    }
  );

  const listable = {
    ...data(),
    updateItems: (items: T[]) => {
      initialItems = items;
      return { ...listable, ...data() };
    },
    search: (searchFn: SearchFn<T>) => {
      search = searchFn;
      return { ...listable, ...data() };
    },
    categorize: (categorizeFn: CategorizeFn<T>) => {
      categorize = categorizeFn;
      return { ...listable, ...data() };
    },
    rank: (rankFn: SortFn<T>) => {
      rank = rankFn;
      return { ...listable, ...data() };
    },
  };

  return listable as any;
}
