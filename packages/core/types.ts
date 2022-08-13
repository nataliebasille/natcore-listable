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
