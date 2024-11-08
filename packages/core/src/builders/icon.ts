import { createElement } from "../helpers/create-element.js";

export const BuildIcon = () => {
  const icon = createElement<SVGElement>({
    attributes: () => ({
      "aria-hidden": "true",
    }),
  })();

  return { icon };
};
