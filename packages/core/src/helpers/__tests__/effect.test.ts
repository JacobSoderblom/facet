import { describe, test, expect, vi } from "vitest";
import { effects, type EffectResult } from "../effect.js";

describe("effects", () => {
  test("should destroy all provided EffectResult", () => {
    const destroy1 = vi.fn();
    const destroy2 = vi.fn();
    const effect1: EffectResult<undefined> = {
      destroy: destroy1,
      update: () => {},
    };
    const effect2: EffectResult<undefined> = {
      destroy: destroy2,
      update: () => {},
    };

    const cleanup = effects(effect1, effect2);
    cleanup();

    expect(destroy1).toHaveBeenCalled();
    expect(destroy2).toHaveBeenCalled();
  });

  test("should ignore undefined EffectResult", () => {
    const destroy1 = vi.fn();
    const effect1: EffectResult<undefined> = {
      destroy: destroy1,
      update: () => {},
    };

    const cleanup = effects(effect1, undefined);
    cleanup();

    expect(destroy1).toHaveBeenCalled();
  });

  test("should handle no arguments", () => {
    const cleanup = effects();
    expect(cleanup).toBeInstanceOf(Function);
    expect(() => cleanup()).not.toThrow();
  });

  test("should handle all undefined arguments", () => {
    const cleanup = effects(undefined, undefined);
    expect(cleanup).toBeInstanceOf(Function);
    expect(() => cleanup()).not.toThrow();
  });
});
