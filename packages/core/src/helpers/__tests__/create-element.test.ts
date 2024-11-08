import { describe, test, expect, vi, beforeEach } from "vitest";
import { createElement } from "../create-element.js";
import type { Effect } from "../effect.js";

describe("createElement", () => {
  let mockElement: HTMLElement;

  beforeEach(() => {
    mockElement = document.createElement("div");
  });

  describe("Without Attributes or Effects", () => {
    test("should create an effect with update and destroy methods", () => {
      const element = createElement<HTMLElement>({
        // No attributes or effects provided
      });

      const effectResult = element()(mockElement);

      expect(effectResult.update).toBeInstanceOf(Function);
      expect(effectResult.destroy).toBeInstanceOf(Function);
    });
  });

  describe("With Attributes", () => {
    test("should apply initial attributes correctly", () => {
      const element = createElement<HTMLElement, { id: string }>({
        attributes: (param) => ({
          id: param.id,
          class: "test-class",
        }),
      });

      element({ id: "initial-id" })(mockElement);

      expect(mockElement.getAttribute("id")).toBe("initial-id");
      expect(mockElement.getAttribute("class")).toBe("test-class");
    });

    test("should update attributes correctly when update is called", () => {
      const element = createElement<HTMLElement, { id: string }>({
        attributes: (param) => ({
          id: param.id,
          class: "test-class",
        }),
      });

      const effectResult = element({ id: "initial-id" })(mockElement);

      effectResult.update({ id: "updated-id" });

      expect(mockElement.getAttribute("id")).toBe("updated-id");
      expect(mockElement.getAttribute("class")).toBe("test-class");
    });

    test("should remove attributes not present in the new attributes", () => {
      const element = createElement<HTMLElement, { id?: string }>({
        attributes: (param) => ({
          id: param.id,
        }),
      });

      const effectResult = element({ id: "initial-id" })(mockElement);

      expect(mockElement.getAttribute("id")).toBe("initial-id");

      effectResult.update({ id: undefined });

      expect(mockElement.getAttribute("id")).toBeNull();
    });
  });

  describe("With Effects", () => {
    test("should initialize and destroy effects correctly", () => {
      const destroyMock = vi.fn();
      const updateMock = vi.fn();

      const effect: Effect<HTMLElement, { value: number }> = () => ({
        update: () => updateMock(),
        destroy: () => destroyMock(),
      });

      const element = createElement<HTMLElement, { value: number }>({
        effect,
      });

      const effectResult = element({ value: 42 })(mockElement);

      expect(updateMock).toHaveBeenCalledTimes(0);
      expect(destroyMock).toHaveBeenCalledTimes(0);

      effectResult.update({ value: 100 });

      expect(updateMock).toHaveBeenCalledTimes(1);

      effectResult.destroy();

      expect(destroyMock).toHaveBeenCalledTimes(1);
    });
  });

  describe("With Both Attributes and Effects", () => {
    test("should handle both attributes and effects", () => {
      const updateMock = vi.fn();
      const destroyMock = vi.fn();

      const effect: Effect<HTMLElement, { title: string }> = () => ({
        update: () => updateMock(),
        destroy: () => destroyMock(),
      });

      const element = createElement<HTMLElement, { title: string }>({
        attributes: (param) => ({
          title: param.title,
        }),
        effect,
      });

      const effectResult = element({
        title: "Initial Title",
      })(mockElement);

      expect(mockElement.getAttribute("title")).toBe("Initial Title");
      expect(updateMock).toHaveBeenCalledTimes(0);
      expect(destroyMock).toHaveBeenCalledTimes(0);

      effectResult.update({ title: "Updated Title" });

      expect(mockElement.getAttribute("title")).toBe("Updated Title");
      expect(updateMock).toHaveBeenCalledTimes(1);

      effectResult.destroy();

      expect(destroyMock).toHaveBeenCalledTimes(1);
    });
  });

  describe("With Optional Props", () => {
    test("should handle undefined Props correctly", () => {
      const destroyMock = vi.fn();

      const effect: Effect<HTMLElement> = () => ({
        update: () => {},
        destroy: () => destroyMock(),
      });

      const element = createElement<HTMLElement>({
        effect,
      });

      const effectResult = element()(mockElement);

      effectResult.update();
      effectResult.destroy();

      expect(destroyMock).toHaveBeenCalledTimes(1);
    });

    test("should not apply attributes when Props are undefined", () => {
      const element = createElement<HTMLElement>({
        attributes: undefined,
      });

      const effectResult = element()(mockElement);

      expect(mockElement.getAttribute("data-test")).toBeNull();

      effectResult.update();

      expect(mockElement.getAttribute("data-test")).toBeNull();
    });
  });

  describe("Effect Management", () => {
    test("should call destroy of previous effect when a new effect is applied", () => {
      const destroyMock1 = vi.fn();
      const destroyMock2 = vi.fn();

      const effect1: Effect<HTMLElement, { val: number }> = () => ({
        update: () => {},
        destroy: () => destroyMock1(),
      });

      const effect2: Effect<HTMLElement, { val: number }> = () => ({
        update: () => {},
        destroy: () => destroyMock2(),
      });

      const element = createElement<HTMLElement, { val: number }>({
        effect: effect1,
      });

      const effectResult1 = element({ val: 1 })(mockElement);

      const newEffectFunction = createElement<HTMLElement, { val: number }>({
        effect: effect2,
      });

      const effectResult2 = newEffectFunction({ val: 2 })(mockElement);

      // Destroy the first effect by applying the new effect
      effectResult1.destroy();

      expect(destroyMock1).toHaveBeenCalledTimes(1);
      expect(destroyMock2).toHaveBeenCalledTimes(0);

      effectResult2.destroy();

      expect(destroyMock2).toHaveBeenCalledTimes(1);
    });
  });
});
