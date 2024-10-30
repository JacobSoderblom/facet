export function on<Type extends keyof WindowEventMap>(
  window: Window,
  type: Type,
  handler: (this: Window, event: WindowEventMap[Type]) => void,
  options?: AddEventListenerOptions,
): () => void;

export function on<Type extends keyof DocumentEventMap>(
  document: Document,
  type: Type,
  handler: (this: Document, event: DocumentEventMap[Type]) => void,
  options?: AddEventListenerOptions,
): () => void;

export function on<
  Element extends HTMLElement,
  Type extends keyof HTMLElementEventMap,
>(
  element: Element,
  type: Type,
  handler: (this: Element, event: HTMLElementEventMap[Type]) => void,
  options?: AddEventListenerOptions,
): () => void;

export function on<
  Element extends MediaQueryList,
  Type extends keyof MediaQueryListEventMap,
>(
  element: Element,
  type: Type,
  handler: (this: Element, event: MediaQueryListEventMap[Type]) => void,
  options?: AddEventListenerOptions,
): () => void;

export function on(
  element: EventTarget,
  type: string,
  handler: EventListener,
  options?: AddEventListenerOptions,
): () => void;

export function on(
  element: EventTarget,
  type: string,
  handler: EventListener,
  options?: AddEventListenerOptions,
): () => void {
  element.addEventListener(type, handler, options);
  return () => element.removeEventListener(type, handler, options);
}
