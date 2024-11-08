import { curriedEffect, type Effect, type EffectResult } from "./effect.js";
import type { HtmlAttributes } from "./html-attributes.js";

export type CreateElementOptions<
  El extends Element,
  Props,
  Attributes extends object,
> = {
  attributes?: Props extends undefined
    ? () => Attributes
    : (param: Props) => Attributes;
  effect?: Effect<El, Props>;
};

export function createElement<
  El extends Element,
  Props = undefined,
  Attributes extends object = HtmlAttributes<El>,
>({ attributes, effect }: CreateElementOptions<El, Props, Attributes>) {
  const applyAttributes = (node: El) => {
    const prevAttributes = new Map<string, unknown>();

    return (param: Props) => {
      if (attributes) {
        const newAttributes = attributes(param);
        for (const [key] of prevAttributes) {
          if (!(key in newAttributes)) {
            node.removeAttribute(key);
            prevAttributes.delete(key);
          }
        }

        for (const [key, val] of Object.entries(newAttributes)) {
          if (!prevAttributes.has(key) || prevAttributes.get(key) !== val) {
            if (val === undefined) {
              node.removeAttribute(key);
            } else {
              node.setAttribute(key, String(val));
            }
            prevAttributes.set(key, val);
          }
        }
      }
    };
  };

  const _effect = ((node: El, props: Props) => {
    const attrs = applyAttributes(node);
    attrs(props);

    const effectResult = effect?.(node, props);
    return {
      update(updatedprops: Props) {
        const param = { ...props, ...updatedprops };
        attrs(param);
        effectResult?.update(param);
      },
      destroy() {
        effectResult?.destroy();
      },
    } as EffectResult<Props>;
  }) as Effect<El, Props>;

  return curriedEffect(_effect);
}
