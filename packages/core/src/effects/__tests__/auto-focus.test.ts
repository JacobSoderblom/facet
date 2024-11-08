vi.mock("../helpers/tick.js", () => ({
  tick: vi.fn(() => Promise.resolve()),
}));

import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import { autoFocus, type AutoFocusProps } from "../auto-focus.js";
import { tick } from "../../helpers/tick.js";
import { tabbable } from "tabbable";

describe("autoFocus", () => {
  let node: HTMLElement;
  let prevElement: HTMLElement;
  let props: AutoFocusProps;
  let effect: ReturnType<typeof autoFocus>;

  beforeEach(() => {
    document.body.innerHTML = `
      <button id="button1">Button 1</button>
      <button id="button2">Button 2</button>
      <div id="container">
        <a href="/test" id="link1">Link 1</a>
        <input type="text" id="input1" />
      </div>
    `;
    // biome-ignore lint/style/noNonNullAssertion: <explanation>
    node = document.querySelector("#container")!;
    // biome-ignore lint/style/noNonNullAssertion: <explanation>
    prevElement = document.querySelector("#button1")!;
    prevElement.focus();
    props = { restore: true };
  });

  afterEach(() => {
    if (effect) effect.destroy();
  });

  test("focuses the first tabbable element inside node after tick", async () => {
    const focusTarget = node.querySelector("#link1");
    const focusSpy = vi.spyOn(focusTarget as HTMLElement, "focus");
    effect = autoFocus(node);
    await tick();

    expect(focusSpy).toHaveBeenCalledWith();
    expect(document.activeElement).toBe(focusTarget);
  });

  test("restores the previous focus on destroy", async () => {
    const focusSpy = vi.spyOn(prevElement, "focus");
    effect = autoFocus(node);
    await tick();

    effect.destroy();
    expect(focusSpy).toHaveBeenCalled();
    expect(document.activeElement).toBe(prevElement);
  });

  test("does not restore focus if restore is false", async () => {
    props.restore = false;
    const focusSpy = vi.spyOn(prevElement, "focus");
    effect = autoFocus(node, props);
    await tick();

    effect.destroy();
    expect(focusSpy).not.toHaveBeenCalled();
    const tabbableElements = tabbable(node);
    expect(document.activeElement).toBe(tabbableElements[0]);
  });

  test("updates the restore property correctly", async () => {
    const focusSpy = vi.spyOn(prevElement, "focus");
    effect = autoFocus(node, props);
    await tick();

    effect.update({ restore: false });
    effect.destroy();
    expect(focusSpy).not.toHaveBeenCalled();
    const tabbableElements = tabbable(node);
    expect(document.activeElement).toBe(tabbableElements[0]);
  });

  test("restores focus based on updated restore property", async () => {
    const focusSpy = vi.spyOn(prevElement, "focus");
    effect = autoFocus(node, props);
    await tick();

    effect.update({ restore: false });
    effect.destroy();
    expect(focusSpy).not.toHaveBeenCalled();
    const tabbableElements = tabbable(node);
    expect(document.activeElement).toBe(tabbableElements[0]);

    // Re-initialize with restore true
    prevElement.focus();
    effect = autoFocus(node, { restore: true });
    await tick();

    effect.destroy();
    expect(focusSpy).toHaveBeenCalled();
    expect(document.activeElement).toBe(prevElement);
  });

  test("handles no tabbable elements gracefully", async () => {
    node.innerHTML = '<div id="empty"></div>';
    effect = autoFocus(node, props);
    const focusSpy = vi.spyOn(HTMLElement.prototype, "focus");
    await tick();

    expect(focusSpy).not.toHaveBeenCalled();
    effect.destroy();
    expect(prevElement).toBe(document.activeElement);
  });
});
