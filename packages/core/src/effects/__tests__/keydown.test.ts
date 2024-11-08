import { keydown, escapeKeydown, type KeydownProps } from "../keydown.js";
import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";

vi.mock("../helpers/on", () => ({
  on: vi.fn((node, event, handler) => ({
    destroy: vi.fn(() => node.removeEventListener(event, handler)),
  })),
}));

describe("keydown", () => {
  let node: HTMLElement;
  let keydownEffect: ReturnType<typeof keydown>;

  beforeEach(() => {
    node = document.createElement("div");
    document.body.appendChild(node);
  });

  afterEach(() => {
    document.body.innerHTML = "";
    vi.clearAllMocks();
  });

  test("should call the correct handler on keydown", () => {
    const spaceHandler = vi.fn();
    const enterHandler = vi.fn();
    const props: KeydownProps = {
      handlers: { Space: spaceHandler, Enter: enterHandler },
    };
    keydownEffect = keydown(node, props);

    const spaceEvent = new KeyboardEvent("keydown", { code: "Space" });
    const enterEvent = new KeyboardEvent("keydown", { code: "Enter" });

    node.dispatchEvent(spaceEvent);
    expect(spaceHandler).toHaveBeenCalledWith(spaceEvent);

    node.dispatchEvent(enterEvent);
    expect(enterHandler).toHaveBeenCalledWith(enterEvent);

    keydownEffect.destroy();
  });

  test("should update handlers on update", () => {
    const initialHandler = vi.fn();
    const updatedHandler = vi.fn();
    keydownEffect = keydown(node, { handlers: { Enter: initialHandler } });

    const enterEvent = new KeyboardEvent("keydown", { code: "Enter" });
    node.dispatchEvent(enterEvent);
    expect(initialHandler).toHaveBeenCalledWith(enterEvent);

    keydownEffect.update({ handlers: { Enter: updatedHandler } });
    node.dispatchEvent(enterEvent);
    expect(updatedHandler).toHaveBeenCalledWith(enterEvent);

    keydownEffect.destroy();
  });

  test("should remove event listener on destroy", () => {
    const handler = vi.fn();
    keydownEffect = keydown(node, { handlers: { Escape: handler } });

    const escapeEvent = new KeyboardEvent("keydown", { code: "Escape" });
    node.dispatchEvent(escapeEvent);
    expect(handler).toHaveBeenCalledWith(escapeEvent);

    keydownEffect.destroy();
    node.dispatchEvent(escapeEvent);
    expect(handler).toHaveBeenCalledTimes(1);
  });
});

describe("escapeKeydown", () => {
  let node: HTMLElement;
  let escapeKeydownEffect: ReturnType<typeof escapeKeydown>;

  beforeEach(() => {
    node = document.createElement("div");
    document.body.appendChild(node);
  });

  afterEach(() => {
    document.body.innerHTML = "";
    vi.clearAllMocks();
  });

  test("should call the Escape handler on Escape keydown", () => {
    const escapeHandler = vi.fn();
    escapeKeydownEffect = escapeKeydown(node, { handler: escapeHandler });

    const escapeEvent = new KeyboardEvent("keydown", { code: "Escape" });
    node.dispatchEvent(escapeEvent);
    expect(escapeHandler).toHaveBeenCalledWith(escapeEvent);

    escapeKeydownEffect.destroy();
  });

  test("should not call the handler for non-Escape keys", () => {
    const escapeHandler = vi.fn();
    escapeKeydownEffect = escapeKeydown(node, { handler: escapeHandler });

    const spaceEvent = new KeyboardEvent("keydown", { code: "Space" });
    node.dispatchEvent(spaceEvent);
    expect(escapeHandler).not.toHaveBeenCalled();

    escapeKeydownEffect.destroy();
  });
});
