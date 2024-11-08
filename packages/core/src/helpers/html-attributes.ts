type HtmlTagNameForElement<T extends HTMLElement> = {
  [K in keyof HTMLElementTagNameMap]: T extends HTMLElementTagNameMap[K]
    ? K
    : never;
}[keyof HTMLElementTagNameMap];

type SvgTagNameForElement<T extends SVGElement> = {
  [K in keyof SVGElementTagNameMap]: T extends SVGElementTagNameMap[K]
    ? K
    : never;
}[keyof SVGElementTagNameMap];

type KebabCase<S extends string> = S extends `${infer T}${infer U}`
  ? U extends Uncapitalize<U>
    ? `${Lowercase<T>}${KebabCase<U>}`
    : `${Lowercase<T>}-${KebabCase<U>}`
  : S;

type AriaAttributes<T> = {
  [K in keyof T as K extends `aria${string}` ? KebabCase<K> : never]: T[K];
};

type RemoveAriaAttributes<T> = {
  [K in keyof T as K extends `aria${string}` ? never : K]: T[K];
};

type Attributes<T extends Element> = T extends HTMLElement
  ? HtmlTagNameForElement<T> extends keyof HTMLElementTagNameMap
    ? HTMLElementTagNameMap[HtmlTagNameForElement<T>]
    : never
  : T extends SVGElement
    ? SvgTagNameForElement<T> extends keyof SVGElementTagNameMap
      ? SVGElementTagNameMap[SvgTagNameForElement<T>]
      : never
    : never;

export type HtmlAttributes<T extends Element> =
  Attributes<T> extends never
    ? never
    : Partial<RemoveAriaAttributes<T> & AriaAttributes<T>>;
