import { vi } from "vitest";
import "@testing-library/jest-dom/vitest";

// Mock the 'tabbable' module with your custom implementations

if (!window.matchMedia) {
  window.matchMedia = vi.fn().mockImplementation((query) => {
    let listeners: Array<(e: Event) => void> = [];

    const mediaQueryList = {
      matches: false,
      media: query,
      onchange: null,
      addListener: (callback: (e: Event) => void) => listeners.push(callback), // Deprecated
      removeListener: (callback: (e: Event) => void) => {
        listeners = listeners.filter((listener) => listener !== callback);
      }, // Deprecated
      addEventListener: (type: string, callback: (e: Event) => void) => {
        if (type === "change") listeners.push(callback);
      },
      removeEventListener: (type: string, callback: (e: Event) => void) => {
        if (type === "change")
          listeners = listeners.filter((listener) => listener !== callback);
      },
      dispatchEvent: (event: Event) => {
        for (const listener of listeners) {
          listener(event);
        }

        return true;
      },
    };

    return mediaQueryList;
  });
}

vi.mock("tabbable");
