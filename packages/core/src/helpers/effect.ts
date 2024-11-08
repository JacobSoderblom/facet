export type EffectResult<Props> = {
  destroy: () => void;
  update: Props extends undefined
    ? () => void
    : (param: Partial<Props>) => void;
};

export type Effect<
  El extends Element,
  Props = undefined,
> = Props extends undefined
  ? (node: El) => EffectResult<undefined>
  : (node: El, param: Props) => EffectResult<Props>;

export type CurriedEffect<
  El extends Element,
  props,
  E extends Effect<El, props>,
> = props extends undefined
  ? () => (node: El) => ReturnType<E>
  : (props: props) => (node: El) => ReturnType<E>;

export function curriedEffect<El extends Element>(
  effect: Effect<El, undefined>,
): CurriedEffect<El, undefined, Effect<El, undefined>>;

export function curriedEffect<El extends Element, Props>(
  effect: Effect<El, Props>,
): CurriedEffect<El, Props, Effect<El, Props>>;

export function curriedEffect<El extends Element, Props>(
  effect: Effect<El, Props>,
): CurriedEffect<El, Props, Effect<El, Props>> {
  if (effect.length === 1) {
    return (() => (node: El) =>
      (effect as Effect<El, undefined>)(node)) as CurriedEffect<
      El,
      Props,
      Effect<El, Props>
    >;
  }

  return ((props: Props) => (node: El) =>
    (effect as Effect<El, Props>)(node, props)) as CurriedEffect<
    El,
    Props,
    Effect<El, Props>
  >;
}
export const effects = (...args: (EffectResult<unknown> | undefined)[]) => {
  const nonUndefinedEffects = args.filter(Boolean) as EffectResult<unknown>[];

  return () => {
    for (const effect of nonUndefinedEffects) {
      effect.destroy();
    }
  };
};
