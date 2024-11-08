import { tabbable } from "tabbable";
import type { Effect } from "../helpers/effect.js";
import { tick } from "../helpers/tick.js";

export type AutoFocusProps = {
  restore?: boolean;
};

export const autoFocus = ((node, props = { restore: true }) => {
  let prevFocus: HTMLElement | null = null;
  let restore = props.restore;

  tick().then(() => {
    prevFocus = document.activeElement as HTMLElement;

    const elements = tabbable(node);
    elements[0]?.focus();
  });

  return {
    update({ restore: updatedRestore }) {
      restore = updatedRestore === undefined ? props.restore : updatedRestore;
    },
    destroy() {
      if (restore) {
        prevFocus?.focus();
      }
    },
  };
}) satisfies Effect<HTMLElement, AutoFocusProps>;
