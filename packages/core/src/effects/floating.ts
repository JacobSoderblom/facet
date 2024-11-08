import {
  arrow,
  autoUpdate,
  computePosition,
  flip,
  offset,
  shift,
  size,
  type Boundary,
  type FlipOptions,
  type Middleware,
  type Placement,
} from "@floating-ui/dom";
import type { Effect } from "../helpers/effect.js";

export type FloatingProps = {
  placement?: Placement;
  strategy?: "absolute" | "fixed";
  offset?: { mainAxis?: number; crossAxis?: number };
  gutter?: number;
  overflowPadding?: number;
  flip?: boolean | FlipOptions;
  overlap?: boolean;
  sameWidth?: boolean;
  fitViewport?: boolean;
  boundary?: Boundary;
  reference: HTMLElement;
};

const defaultProps = {
  strategy: "fixed",
  placement: "top",
  gutter: 5,
  flip: true,
  sameWidth: false,
  overflowPadding: 8,
} satisfies Omit<FloatingProps, "reference">;

const ARROW_TRANSFORM = {
  bottom: "rotate(45deg)",
  left: "rotate(135deg)",
  top: "rotate(225deg)",
  right: "rotate(315deg)",
};

export const floating = ((node, params) => {
  const run = (inc: FloatingProps) => {
    const props = { ...defaultProps, ...inc };

    const arrowEl = node.querySelector("[data-arrow=true]");
    const middlewares: Middleware[] = [];

    if (props.flip) {
      const flipProps = typeof props.flip === "object" ? props.flip : {};

      middlewares.push(
        flip({
          boundary: props.boundary,
          padding: props.overflowPadding,
          ...flipProps,
        }),
      );
    }
    const arrowOffset =
      arrowEl instanceof HTMLElement ? arrowEl.offsetHeight / 2 : 0;
    if (props.gutter || props.offset) {
      const data = props.gutter ? { mainAxis: props.gutter } : props.offset;
      if (data?.mainAxis != null) {
        data.mainAxis += arrowOffset;
      }

      middlewares.push(offset(data));
    }

    middlewares.push(
      shift({
        boundary: props.boundary,
        crossAxis: props.overlap,
        padding: props.overflowPadding,
      }),
    );

    if (arrowEl) {
      middlewares.push(arrow({ element: arrowEl, padding: 8 }));
    }

    middlewares.push(
      size({
        padding: props.overflowPadding,
        apply({ rects, availableHeight, availableWidth }) {
          if (props.sameWidth) {
            Object.assign(node.style, {
              width: `${Math.round(rects.reference.width)}px`,
              minWidth: "unset",
            });
          }

          if (props.fitViewport) {
            Object.assign(node.style, {
              maxWidth: `${availableWidth}px`,
              maxHeight: `${availableHeight}px`,
            });
          }
        },
      }),
    );

    Object.assign(node.style, { position: props.strategy });

    return autoUpdate(props.reference, node, () => {
      if (
        props.reference instanceof HTMLElement &&
        !props.reference.ownerDocument.documentElement.contains(props.reference)
      ) {
        return;
      }

      computePosition(props.reference, node, {
        placement: props.placement,
        middleware: middlewares,
        strategy: props.strategy,
      }).then((data) => {
        const x = Math.round(data.x);
        const y = Math.round(data.y);
        const [side, align = "center"] = data.placement.split("-");

        if (side) {
          node.setAttribute("data-side", side);
        }
        node.setAttribute("data-align", align);

        Object.assign(node.style, {
          position: props.strategy,
          top: `${y}px`,
          left: `${x}px`,
        });

        if (arrowEl instanceof HTMLElement && data.middlewareData.arrow) {
          const { x, y } = data.middlewareData.arrow;

          const dir = data.placement.split("-")[0] as
            | "top"
            | "bottom"
            | "left"
            | "right";

          arrowEl.setAttribute("data-side", dir);

          Object.assign(arrowEl.style, {
            position: "absolute",
            left: x != null ? `${x}px` : "",
            top: y != null ? `${y}px` : "",
            [dir]: `calc(100% - ${arrowOffset}px)`,
            transform: ARROW_TRANSFORM[dir],
          });
        }
        return data;
      });
    });
  };

  let destroy = run(params);

  return {
    update(updatedProps) {
      destroy = run({ ...params, ...updatedProps });
    },
    destroy,
  };
}) satisfies Effect<HTMLElement, FloatingProps>;
