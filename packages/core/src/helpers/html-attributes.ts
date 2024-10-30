type TagNameForElement<T extends HTMLElement> = {
  [K in keyof HTMLElementTagNameMap]: T extends HTMLElementTagNameMap[K]
    ? K
    : never;
}[keyof HTMLElementTagNameMap];

export type HtmlAttributes<T extends HTMLElement> =
  T extends HTMLElementTagNameMap[TagNameForElement<T>]
    ? Partial<HTMLElementTagNameMap[TagNameForElement<T>]> &
        Record<`data-${string}`, string> & { style?: string; class?: string }
    : never;
