import * as lib from "tabbable";

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export const tabbable = (node: HTMLElement, options?: any) =>
  lib.tabbable(node, { ...options, displayCheck: "none" });

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export const focusable = (node: HTMLElement, options?: any) =>
  lib.focusable(node, { ...options, displayCheck: "none" });

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export const isFocusable = (node: HTMLElement, options?: any) =>
  lib.isFocusable(node, { ...options, displayCheck: "none" });

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export const isTabbable = (node: HTMLElement, options?: any) =>
  lib.isTabbable(node, { ...options, displayCheck: "none" });
