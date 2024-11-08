import type { Effect } from "../../helpers/effect.js";
import { debounceEffect } from "../debounce.js";
import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
  afterEach,
  type Mock,
} from "vitest";

let mockEffect: Mock<Effect<HTMLElement, { prop1: string }>>;

describe("debounce", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.spyOn(global, "clearTimeout");

    mockEffect = vi.fn((_node: HTMLElement, _props: { prop1: string }) => ({
      update: vi.fn(),
      destroy: vi.fn(),
    }));
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.resetAllMocks();
    vi.useRealTimers();
  });

  it("should initialize effect after wait period", () => {
    const node = document.createElement("div");
    const debouncedEffect = debounceEffect(mockEffect, 500);
    const result = debouncedEffect(node, { prop1: "initial" });

    expect(mockEffect).not.toHaveBeenCalled();

    vi.advanceTimersByTime(500);
    expect(mockEffect).toHaveBeenCalledWith(node, { prop1: "initial" });

    result.destroy();
  });

  it("should debounce update calls", () => {
    const node = document.createElement("div");
    const debouncedEffect = debounceEffect(mockEffect, 500);
    const result = debouncedEffect(node, { prop1: "initial" });

    vi.advanceTimersByTime(500);
    expect(mockEffect).toHaveBeenCalledTimes(1);

    result.update({ prop1: "update1" });
    result.update({ prop1: "update2" });
    result.update({ prop1: "update3" });

    vi.advanceTimersByTime(400);
    expect(mockEffect).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(100);
    expect(mockEffect).toHaveBeenCalledTimes(2);
    expect(mockEffect).toHaveBeenLastCalledWith(node, { prop1: "update3" });

    result.destroy();
  });

  it("should clear timeout and call destroy on destroy", () => {
    const node = document.createElement("div");
    const debouncedEffect = debounceEffect(mockEffect, 500);
    const result = debouncedEffect(node, { prop1: "initial" });

    vi.advanceTimersByTime(500);

    const destroyInner = mockEffect.mock.results[0]?.value?.destroy;
    expect(destroyInner).toBeDefined();

    result.destroy();
    expect(destroyInner).toHaveBeenCalled();
    expect(clearTimeout).toHaveBeenCalled();
  });
});
