import { describe, expect, beforeEach, afterEach, test, vi } from "vitest";
import { portal } from "../portal.js";

describe("portal Effect", () => {
  let mockElement: HTMLElement;
  let targetElement: HTMLElement;
  let newTargetElement: HTMLElement;
  let anotherTargetElement: HTMLElement;

  beforeEach(() => {
    vi.useFakeTimers();

    mockElement = document.createElement("div");
    mockElement.id = "mock-element";
    mockElement.hidden = true;

    document.body.appendChild(mockElement);
  });

  afterEach(() => {
    vi.useRealTimers();

    mockElement.remove();
    targetElement?.remove();
    newTargetElement?.remove();
    anotherTargetElement?.remove();

    vi.resetAllMocks();
  });

  describe("Initialization", () => {
    test("should append the node to the default target ('body') when no target is provided", () => {
      portal(mockElement);

      vi.advanceTimersToNextFrame();

      expect(document.body.contains(mockElement)).toBe(true);
      expect(mockElement.hidden).toBe(false);
      expect(mockElement.parentElement).toBe(document.body);
      expect(mockElement.dataset.portal).toBe("");
    });

    test("should append the node to a valid string selector target", () => {
      targetElement = document.createElement("div");
      targetElement.id = "app";
      document.body.appendChild(targetElement);

      portal(mockElement, "#app");

      vi.advanceTimersToNextFrame();

      expect(targetElement.contains(mockElement)).toBe(true);
      expect(mockElement.hidden).toBe(false);
      expect(mockElement.parentElement).toBe(targetElement);
      expect(mockElement.dataset.portal).toBe("");
    });

    test("should throw an error for an invalid string selector", () => {
      try {
        portal(mockElement, "#non-existing");
        vi.advanceTimersToNextFrame();
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe(
          'Invalid portal selector: "#non-existing"',
        );
      }
    });

    test("should append the node to a valid HTMLElement target", () => {
      targetElement = document.createElement("div");
      targetElement.id = "app-htmlelement";
      document.body.appendChild(targetElement);

      portal(mockElement, targetElement);

      vi.advanceTimersToNextFrame();

      expect(targetElement.contains(mockElement)).toBe(true);
      expect(mockElement.hidden).toBe(false);
      expect(mockElement.parentElement).toBe(targetElement);
      expect(mockElement.dataset.portal).toBe("");
    });
  });

  describe("Update", () => {
    test("should update the portal to a new valid string selector", () => {
      targetElement = document.createElement("div");
      targetElement.id = "initial-app";
      document.body.appendChild(targetElement);

      newTargetElement = document.createElement("div");
      newTargetElement.id = "new-app";
      document.body.appendChild(newTargetElement);

      const portalInstance = portal(mockElement, "#initial-app");

      vi.advanceTimersToNextFrame();

      expect(targetElement.contains(mockElement)).toBe(true);
      expect(mockElement.parentElement).toBe(targetElement);

      portalInstance.update("#new-app");

      vi.advanceTimersToNextFrame();

      expect(targetElement.contains(mockElement)).toBe(false);
      expect(newTargetElement.contains(mockElement)).toBe(true);
      expect(mockElement.parentElement).toBe(newTargetElement);
    });

    test("should throw an error when updating to an invalid string selector", () => {
      targetElement = document.createElement("div");
      targetElement.id = "initial-app";
      document.body.appendChild(targetElement);

      const portalInstance = portal(mockElement, "#initial-app");

      vi.advanceTimersToNextFrame();

      expect(targetElement.contains(mockElement)).toBe(true);
      expect(mockElement.parentElement).toBe(targetElement);

      try {
        portalInstance.update("#invalid-update-selector");
        vi.advanceTimersToNextFrame();
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe(
          'Invalid portal selector: "#invalid-update-selector"',
        );
      }

      expect(targetElement.contains(mockElement)).toBe(true);
      expect(mockElement.parentElement).toBe(targetElement);
    });

    test("should throw an error when updating to an undefined selector", () => {
      targetElement = document.createElement("div");
      targetElement.id = "initial-app";
      document.body.appendChild(targetElement);

      const portalInstance = portal(mockElement, "#initial-app");

      vi.advanceTimersToNextFrame();

      expect(targetElement.contains(mockElement)).toBe(true);
      expect(mockElement.parentElement).toBe(targetElement);

      try {
        portalInstance.update(undefined);
        vi.advanceTimersToNextFrame();
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe(
          'Invalid portal selector: "#invalid-update-selector"',
        );
      }

      expect(targetElement.contains(mockElement)).toBe(true);
      expect(mockElement.parentElement).toBe(targetElement);
    });

    test("should update the portal to a new valid HTMLElement target", () => {
      targetElement = document.createElement("div");
      targetElement.id = "initial-app";
      document.body.appendChild(targetElement);

      anotherTargetElement = document.createElement("div");
      anotherTargetElement.id = "another-app";
      document.body.appendChild(anotherTargetElement);

      const portalInstance = portal(mockElement, "#initial-app");

      vi.advanceTimersToNextFrame();

      expect(targetElement.contains(mockElement)).toBe(true);
      expect(mockElement.parentElement).toBe(targetElement);

      portalInstance.update(anotherTargetElement);

      vi.advanceTimersToNextFrame();

      expect(targetElement.contains(mockElement)).toBe(false);
      expect(anotherTargetElement.contains(mockElement)).toBe(true);
      expect(mockElement.parentElement).toBe(anotherTargetElement);
    });
  });

  describe("Destroy", () => {
    test("should remove the node from the DOM when destroyed", () => {
      targetElement = document.createElement("div");
      targetElement.id = "app-destroy";
      document.body.appendChild(targetElement);

      const portalInstance = portal(mockElement, "#app-destroy");

      vi.advanceTimersToNextFrame();

      expect(targetElement.contains(mockElement)).toBe(true);
      expect(mockElement.parentElement).toBe(targetElement);

      portalInstance.destroy();

      expect(document.body.contains(mockElement)).toBe(false);
    });
  });
});
