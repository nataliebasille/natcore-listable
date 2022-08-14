import { useListable } from "./useListable";
import { renderHook } from "@testing-library/react";

describe(useListable.name, () => {
  it("doesn't re-search when rerendered with same search and items", () => {
    const searchFn = (item: number) => item % 2 === 0;
    const searchMock = jest.fn(searchFn);
    const items = [1, 2, 3];
    const { result, rerender } = renderHook(
      ({ items, search }) => useListable(items, { search: search }),
      { initialProps: { search: searchMock, items } }
    );
    const [results] = result.current;
    expect(results).toEqual(items.filter(searchFn));
    expect(searchMock).toHaveBeenCalledTimes(3);

    rerender({ items, search: searchMock });

    expect(searchMock).toHaveBeenCalledTimes(3);
    const [updatedResults] = result.current;
    expect(updatedResults).toEqual(items.filter(searchFn));
  });

  it("doesn't re-sort when rerendered with same sort and items", () => {
    const rankFn = (item: number) => -item;
    const rankMock = jest.fn(rankFn);
    const items = [1, 2, 3];
    const { result, rerender } = renderHook(
      ({ items, rank }) => useListable(items, { rank: rank }),
      { initialProps: { rank: rankMock, items } }
    );
    const [results] = result.current;
    expect(results).toEqual([...items].sort((a, b) => rankFn(a) - rankFn(b)));
    const numberOfCalls = rankMock.mock.calls.length;

    rerender({ items, rank: rankMock });

    expect(rankMock).toHaveBeenCalledTimes(numberOfCalls);
    const [updatedResults] = result.current;
    expect(updatedResults).toEqual(
      [...items].sort((a, b) => rankFn(a) - rankFn(b))
    );
  });

  it("updates items", () => {
    const search = (item: number) => item % 2 === 0;
    const rank = (item: number) => -item;
    const { result, rerender } = renderHook(() =>
      useListable([1, 2, 3, 4], { search, rank })
    );
    const [results, updateItems] = result.current;
    expect(results).toEqual([4, 2]);
    updateItems([4, 5, 6]);
    rerender();
    expect(result.current[0]).toEqual([6, 4]);
  });
});
