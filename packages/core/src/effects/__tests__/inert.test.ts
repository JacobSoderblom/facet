vi.mock("../helpers/tick.js", () => ({
  tick: vi.fn(() => Promise.resolve()),
}));

import { tick } from "../../helpers/tick.js";
import { inert } from "../inert.js";
import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";

describe("inert", () => {
  let node: HTMLElement;
  let otherElement1: HTMLElement;
  let otherElement2: HTMLElement;

  beforeEach(() => {
    node = document.createElement("div");
    otherElement1 = document.createElement("div");
    otherElement2 = document.createElement("div");

    document.body.append(node);
    document.body.append(otherElement1);
    document.body.append(otherElement2);

    vi.spyOn(otherElement1, "setAttribute");
    vi.spyOn(otherElement2, "setAttribute");
    vi.spyOn(otherElement1, "removeAttribute");
    vi.spyOn(otherElement2, "removeAttribute");
  });

  afterEach(() => {
    document.body.innerHTML = "";
    vi.restoreAllMocks();
  });

  test("should set 'inert' on all non-related elements on init", async () => {
    const effect = inert(node);
    await tick();

    expect(otherElement1.setAttribute).toHaveBeenCalledWith("inert", "");
    expect(otherElement2.setAttribute).toHaveBeenCalledWith("inert", "");
    expect(node.getAttribute("inert")).toBeNull();

    effect.destroy();
  });

  test("should re-apply 'inert' on update", async () => {
    const effect = inert(node);
    await tick();

    effect.update();
    await tick();

    expect(otherElement1.setAttribute).toHaveBeenCalledTimes(2);
    expect(otherElement2.setAttribute).toHaveBeenCalledTimes(2);

    effect.destroy();
  });

  test("should remove 'inert' attribute on destroy", async () => {
    const effect = inert(node);
    await tick();

    effect.destroy();

    expect(otherElement1.removeAttribute).toHaveBeenCalledWith("inert");
    expect(otherElement2.removeAttribute).toHaveBeenCalledWith("inert");
  });
});
