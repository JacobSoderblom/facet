import {
  beforeEach,
  describe,
  expect,
  test,
  vi,
  afterEach,
  type Mock,
} from "vitest";
import { floating, type FloatingProps } from "../floating.js";
import {
  computePosition,
  autoUpdate,
  flip,
  offset,
  shift,
  arrow,
  size,
} from "@floating-ui/dom";
import "@testing-library/jest-dom";

vi.mock("@floating-ui/dom", () => ({
  computePosition: vi.fn(),
  autoUpdate: vi.fn(),
  flip: vi.fn(),
  offset: vi.fn(),
  shift: vi.fn(),
  arrow: vi.fn(),
  size: vi.fn(),
}));

describe("floating effect", () => {
  let reference: HTMLElement;
  let floatingNode: HTMLElement;
  let arrowElement: HTMLElement;

  const mockComputePosition = computePosition as unknown as Mock;
  const mockAutoUpdate = autoUpdate as unknown as Mock;
  const mockFlip = flip as unknown as Mock;
  const mockOffset = offset as unknown as Mock;
  const mockShift = shift as unknown as Mock;
  const mockArrow = arrow as unknown as Mock;
  const mockSize = size as unknown as Mock;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.resetAllMocks();

    mockFlip.mockImplementation(() => "flip-middleware");
    mockOffset.mockImplementation(() => "offset-middleware");
    mockShift.mockImplementation(() => "shift-middleware");
    mockArrow.mockImplementation(() => "arrow-middleware");
    mockSize.mockImplementation(() => "size-middleware");

    mockAutoUpdate.mockImplementation((reference, floating, callback) => {
      callback(reference, floating);
      return vi.fn();
    });

    mockComputePosition.mockResolvedValue({
      x: 100,
      y: 200,
      placement: "bottom-start",
      middlewareData: {
        arrow: { x: 10, y: 20 },
      },
    });

    reference = document.createElement("button");
    floatingNode = document.createElement("div");
    floatingNode.setAttribute("data-testid", "floating-element");

    arrowElement = document.createElement("div");
    arrowElement.setAttribute("data-arrow", "true");
    floatingNode.appendChild(arrowElement);

    document.body.appendChild(reference);
    document.body.appendChild(floatingNode);
  });

  afterEach(() => {
    vi.useRealTimers();
    document.body.innerHTML = "";
  });

  test("initializes with default props", async () => {
    const props: FloatingProps = {
      reference,
    };

    const { destroy } = floating(floatingNode, props);

    await vi.runAllTimersAsync();

    expect(autoUpdate).toHaveBeenCalledWith(
      reference,
      floatingNode,
      expect.any(Function),
    );
    expect(computePosition).toHaveBeenCalledWith(reference, floatingNode, {
      placement: "top",
      middleware: [
        "flip-middleware",
        "offset-middleware",
        "shift-middleware",
        "arrow-middleware",
        "size-middleware",
      ],
      strategy: "fixed",
    });

    expect(floatingNode).toHaveStyle({
      position: "fixed",
      top: "200px",
      left: "100px",
    });

    expect(floatingNode).toHaveAttribute("data-side", "bottom");
    expect(floatingNode).toHaveAttribute("data-align", "start");

    expect(arrowElement).toHaveAttribute("data-side", "bottom");
    expect(arrowElement).toHaveStyle({
      position: "absolute",
      left: "10px",
      top: "20px",
      bottom: "calc(100% - 0px)",
      transform: "rotate(45deg)",
    });

    destroy();
    expect(mockAutoUpdate).toHaveReturned();
  });

  test("initializes with custom props", async () => {
    const props: FloatingProps = {
      reference,
      placement: "right-end",
      strategy: "absolute",
      offset: { mainAxis: 10, crossAxis: 5 },
      gutter: 15,
      flip: { fallbackPlacements: ["left", "top"] },
      overlap: true,
      sameWidth: true,
      fitViewport: true,
      overflowPadding: 12,
    };

    const { destroy } = floating(floatingNode, props);

    await vi.runAllTimersAsync();

    expect(flip).toHaveBeenCalledWith({
      padding: 12,
      fallbackPlacements: ["left", "top"],
    });
    expect(offset).toHaveBeenCalledWith({ mainAxis: 15 });
    expect(shift).toHaveBeenCalledWith({
      crossAxis: true,
      padding: 12,
    });
    expect(arrow).toHaveBeenCalledWith({ element: arrowElement, padding: 8 });
    expect(size).toHaveBeenCalledWith({
      padding: 12,
      apply: expect.any(Function),
    });

    expect(autoUpdate).toHaveBeenCalledWith(
      reference,
      floatingNode,
      expect.any(Function),
    );
    expect(computePosition).toHaveBeenCalledWith(reference, floatingNode, {
      placement: "right-end",
      middleware: [
        "flip-middleware",
        "offset-middleware",
        "shift-middleware",
        "arrow-middleware",
        "size-middleware",
      ],
      strategy: "absolute",
    });

    expect(floatingNode).toHaveStyle({
      position: "absolute",
      top: "200px",
      left: "100px",
    });

    expect(floatingNode).toHaveAttribute("data-side", "bottom");
    expect(floatingNode).toHaveAttribute("data-align", "start");

    expect(arrowElement).toHaveAttribute("data-side", "bottom");
    expect(arrowElement).toHaveStyle({
      position: "absolute",
      left: "10px",
      top: "20px",
      bottom: "calc(100% - 0px)",
      transform: "rotate(45deg)",
    });

    destroy();
    expect(mockAutoUpdate).toHaveReturned();
  });

  test("updates with new props", async () => {
    const initialProps: FloatingProps = {
      reference,
      placement: "top",
    };

    const updatedProps: Partial<FloatingProps> = {
      placement: "left",
      gutter: 20,
    };

    const { update, destroy } = floating(floatingNode, initialProps);

    await vi.runAllTimersAsync();

    update(updatedProps);

    await vi.runAllTimersAsync();

    expect(computePosition).toHaveBeenCalledTimes(2);
    expect(computePosition).toHaveBeenLastCalledWith(reference, floatingNode, {
      placement: "left",
      middleware: [
        "flip-middleware",
        "offset-middleware",
        "shift-middleware",
        "arrow-middleware",
        "size-middleware",
      ],
      strategy: "fixed",
    });

    expect(floatingNode).toHaveStyle({
      position: "fixed",
      top: "200px",
      left: "100px",
    });

    expect(floatingNode).toHaveAttribute("data-side", "bottom");
    expect(floatingNode).toHaveAttribute("data-align", "start");

    destroy();
    expect(mockAutoUpdate).toHaveReturned();
  });

  test("destroys correctly", () => {
    const props: FloatingProps = {
      reference,
    };

    const { destroy } = floating(floatingNode, props);

    expect(autoUpdate).toHaveBeenCalledWith(
      reference,
      floatingNode,
      expect.any(Function),
    );

    destroy();

    const cleanupFn = mockAutoUpdate.mock.results[0]?.value;
    expect(cleanupFn).toHaveBeenCalled();
  });

  test("handles absence of arrow element", async () => {
    floatingNode.removeChild(arrowElement);

    const props: FloatingProps = {
      reference,
    };

    const { destroy } = floating(floatingNode, props);

    await vi.runAllTimersAsync();

    expect(arrow).not.toHaveBeenCalled();

    expect(floatingNode).toHaveStyle({
      position: "fixed",
      top: "200px",
      left: "100px",
    });

    expect(floatingNode).toHaveAttribute("data-side", "bottom");
    expect(floatingNode).toHaveAttribute("data-align", "start");

    destroy();
  });

  test("handles when reference is removed from DOM", async () => {
    const props: FloatingProps = {
      reference,
    };

    const { destroy } = floating(floatingNode, props);

    reference.remove();

    await vi.runAllTimersAsync();

    expect(computePosition).toHaveBeenCalled();

    destroy();
    expect(mockAutoUpdate).toHaveReturned();
  });
});
