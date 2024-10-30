import { describe, it, expect, vi } from "vitest";
import { on } from "../on.js";

describe("on", () => {
  it("should attach and call event handler on a window event", () => {
    const handler = vi.fn();
    const removeListener = on(window, "resize", handler);

    window.dispatchEvent(new Event("resize"));
    expect(handler).toHaveBeenCalled();

    removeListener();
    handler.mockClear();

    window.dispatchEvent(new Event("resize"));
    expect(handler).not.toHaveBeenCalled();
  });

  it("should attach and call event handler on a document event", () => {
    const handler = vi.fn();
    const removeListener = on(document, "click", handler);

    document.dispatchEvent(new Event("click"));
    expect(handler).toHaveBeenCalled();

    removeListener();
    handler.mockClear();

    document.dispatchEvent(new Event("click"));
    expect(handler).not.toHaveBeenCalled();
  });

  it("should attach and call event handler on an HTML element", () => {
    const handler = vi.fn();
    const div = document.createElement("div");
    const removeListener = on(div, "click", handler);

    div.dispatchEvent(new Event("click"));
    expect(handler).toHaveBeenCalled();

    removeListener();
    handler.mockClear();

    div.dispatchEvent(new Event("click"));
    expect(handler).not.toHaveBeenCalled();
  });

  it("should attach and call event handler on a MediaQueryList event", () => {
    const handler = vi.fn();
    const mediaQueryList = window.matchMedia("(max-width: 600px)");
    const removeListener = on(mediaQueryList, "change", handler);

    mediaQueryList.dispatchEvent(new Event("change"));
    expect(handler).toHaveBeenCalled();

    removeListener();
    handler.mockClear();

    mediaQueryList.dispatchEvent(new Event("change"));
    expect(handler).not.toHaveBeenCalled();
  });

  it("should pass event options when attaching an event listener", () => {
    const handler = vi.fn();
    const div = document.createElement("div");
    const options = { once: true };
    const removeListener = on(div, "click", handler, options);

    div.dispatchEvent(new Event("click"));
    expect(handler).toHaveBeenCalled();

    handler.mockClear();
    div.dispatchEvent(new Event("click"));
    expect(handler).not.toHaveBeenCalled();

    removeListener();
  });
});
