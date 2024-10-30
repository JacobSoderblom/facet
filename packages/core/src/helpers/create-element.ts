import type { HtmlAttributes } from "./html-attributes.js";

export type EffectResult = {
  destroy?: () => void;
  update?: () => void;
};

export type CreateElementOptions<
  Element extends HTMLElement,
  Attributes extends object,
> = {
  attributes?: () => Attributes;
  effect?: (node: Element) => EffectResult;
};

export function createElement<
  Element extends HTMLElement,
  Attributes extends object = HtmlAttributes<Element>,
>({ attributes, effect }: CreateElementOptions<Element, Attributes>) {
  return (node: Element): EffectResult => {
    const prevAttributes = new Map<string, unknown>();
    let currentEffect: EffectResult | undefined;

    const applyAttributes = () => {
      const newAttributes = attributes ? attributes() : {};
      for (const [key] of prevAttributes) {
        if (!(key in newAttributes)) {
          node.removeAttribute(key);
          prevAttributes.delete(key);
        }
      }

      for (const [key, val] of Object.entries(newAttributes)) {
        if (prevAttributes.get(key) !== val) {
          if (val === undefined) {
            node.removeAttribute(key);
          } else {
            node.setAttribute(key, String(val));
          }
          prevAttributes.set(key, val);
        }
      }
    };

    const applyEffect = () => {
      if (effect) {
        currentEffect?.destroy?.();
        currentEffect = effect(node);
      }
    };

    applyAttributes();
    applyEffect();

    return {
      update() {
        applyAttributes();
        currentEffect?.update?.();
      },
      destroy() {
        currentEffect?.destroy?.();
      },
    };
  };
}
