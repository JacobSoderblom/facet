import { describe, it, expect, vi, beforeEach } from "vitest";
import { createElement } from "../create-element.js";

const createMockElement = () => document.createElement("div");

describe("createElement", () => {
  let element: HTMLElement;

  beforeEach(() => {
    element = createMockElement();
  });

  it("should apply initial attributes to the element", () => {
    const setupElement = createElement({
      attributes: () => ({
        "data-role": "button",
        title: "Initial Title",
      }),
    });

    setupElement(element);

    expect(element.getAttribute("data-role")).toBe("button");
    expect(element.getAttribute("title")).toBe("Initial Title");
  });

  it("should update attributes when `update` is called", () => {
    let toggle = true;

    const setupElement = createElement({
      attributes: () => ({
        "data-active": toggle ? "true" : "false",
      }),
    });

    const elementEffect = setupElement(element);

    expect(element.getAttribute("data-active")).toBe("true");

    toggle = false;
    elementEffect.update?.();

    expect(element.getAttribute("data-active")).toBe("false");
  });

  it("should remove attributes that are no longer present in the updated attributes", () => {
    let includeAttribute = true;

    const setupElement = createElement({
      attributes: () => ({
        "data-toggle": includeAttribute ? "enabled" : undefined,
      }),
    });

    const elementEffect = setupElement(element);

    expect(element.getAttribute("data-toggle")).toBe("enabled");

    includeAttribute = false;
    elementEffect.update?.();

    expect(element.hasAttribute("data-toggle")).toBe(false);
  });

  it("should call effect's `destroy` and `update` functions correctly", () => {
    const destroyMock = vi.fn();
    const updateMock = vi.fn();

    const setupElement = createElement({
      attributes: () => ({
        title: "Test Title",
      }),
      effect: () => ({
        destroy: destroyMock,
        update: updateMock,
      }),
    });

    const elementEffect = setupElement(element);

    elementEffect.update?.();
    expect(updateMock).toHaveBeenCalled();

    elementEffect.destroy?.();
    expect(destroyMock).toHaveBeenCalled();
  });

  it("should initialize and apply effect on the element", () => {
    const applyMock = vi.fn();

    const setupElement = createElement({
      effect: (node) => {
        applyMock();
        node.addEventListener("click", () => console.log("Clicked!"));

        return {
          destroy: () =>
            node.removeEventListener("click", () => console.log("Clicked!")),
        };
      },
    });

    setupElement(element);

    // Check if the effect's apply function was called
    expect(applyMock).toHaveBeenCalled();
  });
});
