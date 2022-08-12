export type SearchFn<TItem> = (item: TItem) => boolean;
export type CategorizeFn<TItem> = (
  item: TItem
) => string | readonly [string, number];
export type SortFn<TItem> = {
  (item: TItem): number;
};

export type Category<TItem> = {
  name: string;
  items: ReadonlyArray<TItem>;
};

export type CreateListableOptions<TItem> = {
  readonly initialItems?: ReadonlyArray<TItem>;
  readonly search?: SearchFn<TItem>;
  readonly categorize?: CategorizeFn<TItem>;
  readonly rank?: SortFn<TItem>;
};

interface BaseListable<Item> {
  readonly items: ReadonlyArray<Item>;
  readonly results: ReadonlyArray<Item>;
}

export interface Listable<TItem> extends BaseListable<TItem> {
  updateItems(items: ReadonlyArray<TItem>): Listable<TItem>;
  search(searchFn: SearchFn<TItem>): Listable<TItem>;
  rank(rank: SortFn<TItem>): Listable<TItem>;
  categorize(categorizeFn: CategorizeFn<TItem>): CategorizedListable<TItem>;
}

export interface CategorizedListable<TItem>
  extends BaseListable<Category<TItem>> {
  categories: ReadonlyArray<Category<TItem>>;
  updateItems(items: ReadonlyArray<TItem>): CategorizedListable<TItem>;
  search(searchFn: SearchFn<TItem>): CategorizedListable<TItem>;
  rank(rank: SortFn<TItem>): CategorizedListable<TItem>;
  categorize(categorizeFn: CategorizeFn<TItem>): CategorizedListable<TItem>;
}
