import type { Effect } from "../helpers/effect.js";
import { tick } from "../helpers/tick.js";

export type PortalTarget = string | HTMLElement | undefined;

export const portal = ((node: HTMLElement, target: PortalTarget = "body") => {
  const update = async (selector: PortalTarget) => {
    let element: Element | null = null;

    if (typeof selector === "string") {
      element = document.querySelector(selector);

      if (!element) {
        await tick();
        element = document.querySelector(selector);
      }
    } else if (selector instanceof HTMLElement) {
      element = selector;
    }

    if (!element || !(element instanceof HTMLElement)) {
      throw new Error(`Invalid portal selector: "${selector}"`);
    }

    node.dataset.portal = "";
    element.append(node);
    node.hidden = false;
  };

  update(target);
  return {
    update(param: PortalTarget) {
      update(param || target);
    },
    destroy: () => node.remove(),
  };
}) satisfies Effect<HTMLElement, PortalTarget>;
