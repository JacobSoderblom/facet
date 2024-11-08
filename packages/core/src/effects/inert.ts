import type { Effect } from "../helpers/effect.js";
import { tick } from "../helpers/tick.js";

export const inert = ((node) => {
  let elements: Element[] = [];
  const run = async () => {
    await tick();

    elements = Array.from(document.body.children).filter(
      (element) =>
        !element.contains(node) &&
        element !== node &&
        element.tagName !== "SCRIPT" &&
        element.tagName !== "STYLE" &&
        element.tagName !== "LINK",
    );

    for (const el of elements) {
      el.setAttribute("inert", "");
    }
  };

  run();
  return {
    update() {
      run();
    },
    destroy() {
      for (const el of elements) {
        el.removeAttribute("inert");
      }
    },
  };
}) satisfies Effect<HTMLElement>;
