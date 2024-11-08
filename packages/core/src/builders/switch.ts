import { BuildCheckbox, type CheckboxBuilderProps } from "./checkbox.js";

export type SwitchBuilderProps = Omit<CheckboxBuilderProps, "role">;

export const BuildSwitch = (props: SwitchBuilderProps) =>
  BuildCheckbox({ ...props, role: "switch" });
