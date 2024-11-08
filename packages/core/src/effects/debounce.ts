import type { Effect } from "../helpers/effect.js";

export const debounceEffect = <Element extends HTMLElement, Props>(
  effect: Effect<Element, Props>,
  wait = 500,
) => {
  const debounceEffect = ((node, props) => {
    let timeoutRef: NodeJS.Timer;
    let destroyInner: () => void;

    const run = (p: Props) => {
      clearTimeout(timeoutRef);
      timeoutRef = setTimeout(() => {
        destroyInner = effect(node, p).destroy;
      }, wait);
    };

    run(props);

    return {
      update(updatedprops) {
        run({ ...props, ...updatedprops });
      },
      destroy() {
        clearTimeout(timeoutRef);
        destroyInner?.();
      },
    };
  }) as Effect<Element, Props>;

  return debounceEffect;
};
