import type { EffectResult } from "./effect.js";

export function on<Type extends keyof WindowEventMap>(
  window: Window,
  type: Type,
  handler: (this: Window, event: WindowEventMap[Type]) => void,
  options?: AddEventListenerOptions | boolean,
): EffectResult<undefined>;

export function on<Type extends keyof DocumentEventMap>(
  document: Document,
  type: Type,
  handler: (this: Document, event: DocumentEventMap[Type]) => void,
  options?: AddEventListenerOptions | boolean,
): EffectResult<undefined>;

export function on<
  Element extends HTMLElement,
  Type extends keyof HTMLElementEventMap,
>(
  element: Element,
  type: Type,
  handler: (this: Element, event: HTMLElementEventMap[Type]) => void,
  options?: AddEventListenerOptions | boolean,
): EffectResult<undefined>;

export function on<
  Element extends MediaQueryList,
  Type extends keyof MediaQueryListEventMap,
>(
  element: Element,
  type: Type,
  handler: (this: Element, event: MediaQueryListEventMap[Type]) => void,
  options?: AddEventListenerOptions | boolean,
): EffectResult<undefined>;

export function on(
  element: EventTarget,
  type: string,
  handler: EventListener,
  options?: AddEventListenerOptions | boolean,
): EffectResult<undefined>;

export function on(
  element: EventTarget,
  type: string,
  handler: EventListener,
  options?: AddEventListenerOptions | boolean,
): EffectResult<undefined> {
  element.addEventListener(type, handler, options);
  return {
    destroy() {
      element.removeEventListener(type, handler, options);
    },
    update() {},
  };
}
