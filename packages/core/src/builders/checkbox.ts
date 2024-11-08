import { keydown } from "../effects/keydown.js";
import { createElement } from "../helpers/create-element.js";
import { effects } from "../helpers/effect.js";
import type { HtmlAttributes } from "../helpers/html-attributes.js";
import { on } from "../helpers/on.js";

export type TriggerProps = {
  checked?: boolean;
  disabled?: boolean;
  required?: boolean;
  onChange?: (o: boolean) => void;
  role?: HtmlAttributes<HTMLElement>["role"];
};

export type HiddenInputProps = {
  name: string;
  required?: boolean;
  value: string;
  checked?: boolean;
  disabled?: boolean;
};

export type CheckboxBuilderProps = TriggerProps & HiddenInputProps;

export const BuildCheckbox = (props: CheckboxBuilderProps) => {
  const trigger = createElement<HTMLButtonElement, TriggerProps>({
    attributes: ({ disabled, checked, required, role }) => ({
      "data-state": checked ? "checked" : "unchecked",
      "data-disabled": disabled ? "true" : undefined,
      disabled: disabled ? true : undefined,
      type: "button",
      role: role || "checkbox",
      "aria-checked": checked ? "true" : "false",
      "aria-required": required ? "true" : undefined,
    }),
    effect: (node, { onChange, checked }) => {
      const handleKeyEvent = (e: KeyboardEvent) => {
        e.preventDefault();
        onChange?.(!checked);
      };

      const unsub = effects(
        on(node, "click", () => {
          onChange?.(!checked);
        }),
        keydown(node, {
          handlers: { Enter: handleKeyEvent, Space: handleKeyEvent },
        }),
      );

      return {
        destroy() {
          unsub();
        },
        update() {},
      };
    },
  });

  const input = createElement<HTMLInputElement, HiddenInputProps>({
    attributes: ({ name, value, checked, required, disabled }) => ({
      type: "checkbox",
      "aria-hidden": "true",
      tabindex: -1,
      name: name,
      value: value,
      checked: checked ? true : undefined,
      required: required,
      disabled: disabled ? true : undefined,
    }),
  });

  return { trigger: trigger(props), hiddenInput: input(props) };
};
