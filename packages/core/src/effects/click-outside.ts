import type { Effect } from "../helpers/effect.js";
import { on } from "../helpers/on.js";
import { debounce } from "../helpers/debounce.js";

export type ClickOutsideEvent =
  | "pointerdown"
  | "pointerup"
  | "mousedown"
  | "mouseup"
  | "touchstart"
  | "touchend"
  | "click";

export type ClickOutsideProps = {
  handler: (evt: PointerEvent | MouseEvent | TouchEvent) => void;
  onStart?: (evt: PointerEvent | MouseEvent | TouchEvent) => void;
};

const layers = new Set<HTMLElement>();

export const clickOutside = ((node, props) => {
  let unsubscribers: (() => void)[] = [];

  const interceptedEvents = {
    pointerdown: false,
    pointerup: false,
    mousedown: false,
    mouseup: false,
    touchstart: false,
    touchend: false,
    click: false,
  };

  const documentObj = node.ownerDocument;

  let isPointerDown = false;
  let isPointerDownInside = false;

  const resetInterceptedEvents = () => {
    for (const eventType in interceptedEvents) {
      interceptedEvents[eventType as ClickOutsideEvent] = false;
    }
  };

  const isAnyEventIntercepted = () =>
    Object.values(interceptedEvents).some(Boolean);

  const setupCapturePhaseHandlerAndMarkAsIntercepted = <
    E extends ClickOutsideEvent,
  >(
    eventType: E,
    handler?: (e: HTMLElementEventMap[E]) => void,
  ) => {
    return on(
      documentObj,
      eventType,
      (e: HTMLElementEventMap[E]) => {
        interceptedEvents[eventType] = true;
        handler?.(e);
      },
      true,
    ).destroy;
  };

  const setupBubblePhaseHandlerAndMarkAsNotIntercepted = <
    E extends ClickOutsideEvent,
  >(
    eventType: E,
    handler?: (e: HTMLElementEventMap[E]) => void,
  ) => {
    return on(documentObj, eventType, (e: HTMLElementEventMap[E]) => {
      interceptedEvents[eventType] = false;
      handler?.(e);
    }).destroy;
  };

  const update = (props: ClickOutsideProps) => {
    layers.add(node);

    let topLayerPointerDownCapture = false;

    const onPointerDownDebounced = debounce(
      (e: PointerEvent | MouseEvent | TouchEvent) => {
        if (!topLayerPointerDownCapture || isAnyEventIntercepted()) return;

        if (props.onStart && isValidEvent(e, node)) props.onStart(e);

        if (
          e.target instanceof Element &&
          (node === e.target || node.contains(e.target))
        ) {
          isPointerDownInside = true;
        }
        isPointerDown = true;
      },
      10,
    );

    const onPointerUpDebounced = debounce(
      (e: PointerEvent | MouseEvent | TouchEvent) => {
        if (
          topLayerPointerDownCapture &&
          !isAnyEventIntercepted() &&
          isPointerDown &&
          !isPointerDownInside &&
          isValidEvent(e, node)
        ) {
          props.handler(e);
        }

        isPointerDown = false;
        isPointerDownInside = false;
      },
      10,
    );

    const resetInterceptedEventsDebounced = debounce(
      resetInterceptedEvents,
      20,
    );

    const markTopLayerInPointerDown = () => {
      topLayerPointerDownCapture = isHighestLayer(node);
    };
    unsubscribers = [
      setupCapturePhaseHandlerAndMarkAsIntercepted(
        "pointerdown",
        markTopLayerInPointerDown,
      ),
      setupCapturePhaseHandlerAndMarkAsIntercepted(
        "mousedown",
        markTopLayerInPointerDown,
      ),
      setupCapturePhaseHandlerAndMarkAsIntercepted(
        "touchstart",
        markTopLayerInPointerDown,
      ),

      setupCapturePhaseHandlerAndMarkAsIntercepted(
        "pointerup",
        resetInterceptedEventsDebounced,
      ),
      setupCapturePhaseHandlerAndMarkAsIntercepted(
        "mouseup",
        resetInterceptedEventsDebounced,
      ),
      setupCapturePhaseHandlerAndMarkAsIntercepted(
        "touchend",
        resetInterceptedEventsDebounced,
      ),
      setupCapturePhaseHandlerAndMarkAsIntercepted(
        "click",
        resetInterceptedEventsDebounced,
      ),

      setupBubblePhaseHandlerAndMarkAsNotIntercepted(
        "pointerdown",
        onPointerDownDebounced,
      ),
      setupBubblePhaseHandlerAndMarkAsNotIntercepted(
        "mousedown",
        onPointerDownDebounced,
      ),
      setupBubblePhaseHandlerAndMarkAsNotIntercepted(
        "touchstart",
        onPointerDownDebounced,
      ),

      setupBubblePhaseHandlerAndMarkAsNotIntercepted(
        "pointerup",
        onPointerUpDebounced,
      ),
      setupBubblePhaseHandlerAndMarkAsNotIntercepted(
        "mouseup",
        onPointerUpDebounced,
      ),
      setupBubblePhaseHandlerAndMarkAsNotIntercepted(
        "touchend",
        onPointerUpDebounced,
      ),
      setupBubblePhaseHandlerAndMarkAsNotIntercepted(
        "click",
        onPointerUpDebounced,
      ),

      onPointerDownDebounced.destroy,
      onPointerUpDebounced.destroy,
      resetInterceptedEventsDebounced.destroy,
    ];
  };

  update(props);

  return {
    update(updatedProps) {
      for (const unsub of unsubscribers) {
        unsub();
      }
      update({ ...props, ...updatedProps });
    },
    destroy() {
      layers.delete(node);
      for (const unsub of unsubscribers) {
        unsub();
      }
    },
  };
}) satisfies Effect<HTMLElement, ClickOutsideProps>;

function isValidEvent(
  e: PointerEvent | MouseEvent | TouchEvent,
  node: HTMLElement,
): boolean {
  if ("button" in e && e.button > 0) return false;
  const target = e.target;
  if (!(target instanceof Element)) return false;

  const ownerDocument = target.ownerDocument;
  if (!ownerDocument || !ownerDocument.documentElement.contains(target)) {
    return false;
  }

  return node && !(node === target || node.contains(target));
}

const isHighestLayer = (node: HTMLElement) => {
  return Array.from(layers).at(-1) === node;
};
