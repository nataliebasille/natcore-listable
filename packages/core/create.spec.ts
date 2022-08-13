import { create } from "./create";
import * as fc from "fast-check";

const arrayOfIntegers = fc.array(fc.integer());
describe(create.name, () => {
  it("initializes with provided list of items", () => {
    fc.assert(
      fc.property(arrayOfIntegers, (items) => {
        const listable = create(items);
        expect(listable()).toEqual(items);
      })
    );
  });

  it("results are filtered based on initial searchFn", () => {
    fc.assert(
      fc.property(arrayOfIntegers, (items) => {
        const search = (item: number) => item > 0;
        const listable = create(items);
        expect(listable({ search })).toEqual(items.filter(search));
      })
    );
  });

  it("results are sorted based on initial rankFn", () => {
    fc.assert(
      fc.property(arrayOfIntegers, (items) => {
        const rank = (item: number) => -item;
        const listable = create(items);
        expect(listable({ rank })).toEqual(
          items.sort((a, b) => rank(a) - rank(b))
        );
      })
    );
  });

  it("items are categorized based on initial categorizeFn", () => {
    fc.assert(
      fc.property(arrayOfIntegers, (items) => {
        const categorize = (item: number) =>
          item >= 0 ? "nonnegative" : "negative";
        const listable = create(items);
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

        expect(listable({ categorize })).toEqual(expectedCategories);
      })
    );
  });

  it("categories are sorted based on initial categorizeFn", () => {
    fc.assert(
      fc.property(arrayOfIntegers, (items) => {
        const listable = create(items);
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

        expect(
          listable({
            categorize: (item: number) =>
              (
                [
                  ["nonnegative", -1],
                  ["negative", 1],
                ] as const
              )[item >= 0 ? 0 : 1],
          })
        ).toEqual(expectedCategories);
      })
    );
  });
});
