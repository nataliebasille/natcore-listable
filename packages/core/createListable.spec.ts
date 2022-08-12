import { createListable } from "./createListable";
import * as fc from "fast-check";

const arrayOfIntegers = fc.array(fc.integer());
describe(createListable.name, () => {
  it("initializes with provided list of items", () => {
    fc.assert(
      fc.property(arrayOfIntegers, (items) => {
        const listable = createListable({ initialItems: items });
        expect(listable.items).toEqual(items);
      })
    );
  });

  it("results are filtered based on initial searchFn", () => {
    fc.assert(
      fc.property(arrayOfIntegers, (items) => {
        const search = (item: number) => item > 0;
        const listable = createListable({
          initialItems: items,
          search,
        });
        expect(listable.results).toEqual(items.filter(search));
      })
    );
  });

  it("results are sorted based on initial rankFn", () => {
    fc.assert(
      fc.property(arrayOfIntegers, (items) => {
        const rank = (item: number) => -item;
        const listable = createListable({
          initialItems: items,
          rank,
        });
        expect(listable.results).toEqual(items.sort(rank));
      })
    );
  });

  it("items are categorized based on initial categorizeFn", () => {
    fc.assert(
      fc.property(arrayOfIntegers, (items) => {
        const categorize = (item: number) =>
          item >= 0 ? "nonnegative" : "negative";
        const listable = createListable({
          initialItems: items,
          categorize,
        });
        const nonNegativeCategory = {
          name: "nonnegative",
          items: items.filter((item) => item >= 0),
        };
        const negativeCategory = {
          name: "negative",
          items: items.filter((item) => item < 0),
        };
        const hasNonNegative = items.some((x) => x >= 0);
        const hasNegative = items.some((x) => x < 0);

        const nonNegativeFirst = items[0] >= 0;
        let expectedCategories = [
          ...(hasNonNegative ? [nonNegativeCategory] : []),
          ...(hasNegative ? [negativeCategory] : []),
        ];

        if (!nonNegativeFirst) {
          expectedCategories = expectedCategories.reverse();
        }

        expect(listable.categories).toEqual(expectedCategories);
      })
    );
  });

  it("categories are sorted based on initial categorizeFn", () => {
    fc.assert(
      fc.property(arrayOfIntegers, (items) => {
        const listable = createListable({
          initialItems: items,
          categorize: (item: number) =>
            (
              [
                ["nonnegative", -1],
                ["negative", 1],
              ] as const
            )[item >= 0 ? 0 : 1],
        });
        const nonNegativeCategory = {
          name: "nonnegative",
          items: items.filter((item) => item >= 0),
        };
        const negativeCategory = {
          name: "negative",
          items: items.filter((item) => item < 0),
        };
        const hasNonNegative = items.some((x) => x >= 0);
        const hasNegative = items.some((x) => x < 0);

        const expectedCategories = [
          ...(hasNonNegative ? [nonNegativeCategory] : []),
          ...(hasNegative ? [negativeCategory] : []),
        ];

        expect(listable.categories).toEqual(expectedCategories);
      })
    );
  });

  it("results update when items change", () => {
    fc.assert(
      fc.property(
        arrayOfIntegers,
        arrayOfIntegers,
        (initialItems, updateItems) => {
          const search = (item: number) => item > 0;
          const rank = (item: number) => -item;

          const listable = createListable({ initialItems, search, rank });
          const updatedListable = listable.updateItems(updateItems);
          expect(updatedListable.results).toEqual(
            updateItems.filter(search).sort((a, b) => rank(a) - rank(b))
          );
        }
      )
    );
  });
});
