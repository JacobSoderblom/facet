import { describe, it, expect } from "vitest";
import { BuildIcon } from "../icon.js";

describe("BuildIcon", () => {
  it("should render trigger and input with correct attributes based on props", () => {
    const { icon } = BuildIcon();

    const iconNode = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "svg",
    );

    icon(iconNode);

    expect(iconNode.getAttribute("aria-hidden")).toBe("true");
  });
});
