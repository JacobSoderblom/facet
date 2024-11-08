import type { Effect } from "../helpers/effect.js";
import { on } from "../helpers/on.js";

export type KeydownProps = {
  handlers: Record<string, (e: KeyboardEvent) => void>;
};

export const keydown = ((node: HTMLElement, props: KeydownProps) => {
  let unsub: () => void;

  const run = ({ handlers }: KeydownProps) => {
    unsub = on(node, "keydown", (e) => {
      const key = e.code || e.key;
      const code = key === " " ? "Space" : key;

      handlers[code]?.(e);
    }).destroy;
  };

  run(props);

  return {
    update(updatedProps) {
      run({ ...props, ...updatedProps });
    },
    destroy() {
      unsub();
    },
  };
}) satisfies Effect<HTMLElement, KeydownProps>;

export type EscapeKeydownProps = {
  handler: (evt: KeyboardEvent) => void;
};

export const escapeKeydown = ((node: HTMLElement, props: EscapeKeydownProps) =>
  keydown(node, {
    handlers: {
      Escape: props.handler,
    },
  })) as Effect<HTMLElement, EscapeKeydownProps>;
