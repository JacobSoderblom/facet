import {
  describe,
  test,
  expect,
  vi,
  beforeEach,
  afterEach,
  type Mock,
} from "vitest";
import { clickOutside, type ClickOutsideProps } from "../click-outside.js";
import type { Effect } from "../../helpers/effect.js";

describe("clickOutside", () => {
  let node: HTMLElement;
  let handler: Mock;
  let onStart: Mock;
  let effect: ReturnType<Effect<HTMLElement, ClickOutsideProps>>;

  beforeEach(() => {
    vi.useFakeTimers();
    document.body.innerHTML = `
      <div id="parent">
        <div id="child"></div>
      </div>
      <div id="outside"></div>
    `;

    // biome-ignore lint/style/noNonNullAssertion: <explanation>
    node = document.getElementById("child")!;
    handler = vi.fn();
    onStart = vi.fn();
    effect = clickOutside(node, { handler, onStart });
  });

  afterEach(() => {
    vi.useRealTimers();
    effect.destroy();
    vi.clearAllMocks();
  });

  test("calls handler on click outside", () => {
    const outside = document.getElementById("outside");
    click(outside);
    expect(handler).toHaveBeenCalled();
  });

  test("does not call handler on click inside", () => {
    const child = document.getElementById("child");
    click(child);
    expect(handler).not.toHaveBeenCalled();
  });

  test("does not call onStart on pointerdown outside", () => {
    const outside = document.getElementById("outside");
    const event = new MouseEvent("pointerdown", { bubbles: true });
    outside?.dispatchEvent(event);
    expect(onStart).not.toHaveBeenCalled();
  });

  test("debounces handler calls", async () => {
    const outside = document.getElementById("outside");
    click(outside, true);
    click(outside, true);
    click(outside, true);
    expect(handler).toHaveBeenCalledTimes(0);
    vi.advanceTimersByTime(10);
    expect(handler).toHaveBeenCalledTimes(1);
  });

  test("updates props correctly", () => {
    const newHandler = vi.fn();
    effect.update({ handler: newHandler });
    const outside = document.getElementById("outside");
    click(outside);
    expect(handler).not.toHaveBeenCalled();
    expect(newHandler).toHaveBeenCalled();
  });

  test("removes event listeners on destroy", () => {
    effect.destroy();
    const outside = document.getElementById("outside");
    click(outside);
    expect(handler).not.toHaveBeenCalled();
  });

  test("handles multiple layers correctly", () => {
    const newNode = document.createElement("div");
    document.body.appendChild(newNode);
    const newHandler = vi.fn();
    const newEffect = clickOutside(newNode, { handler: newHandler });
    const outside = document.getElementById("outside");
    click(outside);
    expect(newHandler).toHaveBeenCalled();
    expect(handler).not.toHaveBeenCalled();
    newEffect.destroy();
  });

  test("does not call handler if click is on node", () => {
    click(node);
    expect(handler).not.toHaveBeenCalled();
  });

  test("does not call handler if mouse button is not 0", () => {
    const event = new MouseEvent("click", { button: 1, bubbles: true });
    const outside = document.getElementById("outside");
    outside?.dispatchEvent(event);
    expect(handler).not.toHaveBeenCalled();
  });

  test("does not call handler if target is not an Element", () => {
    const event = new MouseEvent("click", { bubbles: true });
    Object.defineProperty(event, "target", { value: null });
    document.dispatchEvent(event);
    expect(handler).not.toHaveBeenCalled();
  });

  test("does not call handler if target is not in document", () => {
    const event = new MouseEvent("click", { bubbles: true });
    document.dispatchEvent(event);
    expect(handler).not.toHaveBeenCalled();
  });
});

const click = (node?: HTMLElement | null, skip = false) => {
  node?.dispatchEvent(new MouseEvent("pointerdown", { bubbles: true }));
  if (!skip) {
    vi.advanceTimersByTime(10);
  }
  node?.dispatchEvent(new MouseEvent("pointerup", { bubbles: true }));

  if (!skip) {
    vi.advanceTimersByTime(10);
  }
};
