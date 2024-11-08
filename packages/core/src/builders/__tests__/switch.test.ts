import { describe, it, expect, vi } from "vitest";
import { BuildSwitch } from "../switch.js";

describe("BuildSwitch", () => {
  it("should render trigger and input with correct attributes based on props", () => {
    const { trigger, hiddenInput: input } = BuildSwitch({
      name: "testCheckbox",
      value: "testValue",
      checked: true,
      required: true,
      disabled: true,
    });

    const triggerNode = document.createElement("button");
    const inputNode = document.createElement("input");

    trigger(triggerNode);
    input(inputNode);

    expect(triggerNode.getAttribute("data-state")).toBe("checked");
    expect(triggerNode.getAttribute("data-disabled")).toBe("true");
    expect(triggerNode.disabled).toBe(true);
    expect(triggerNode.getAttribute("type")).toBe("button");
    expect(triggerNode.getAttribute("role")).toBe("switch");
    expect(triggerNode.getAttribute("aria-checked")).toBe("true");
    expect(triggerNode.getAttribute("aria-required")).toBe("true");

    expect(inputNode.getAttribute("type")).toBe("checkbox");
    expect(inputNode.getAttribute("aria-hidden")).toBe("true");
    expect(inputNode.getAttribute("tabindex")).toBe("-1");
    expect(inputNode.getAttribute("name")).toBe("testCheckbox");
    expect(inputNode.getAttribute("value")).toBe("testValue");
    expect(inputNode.checked).toBe(true);
    expect(inputNode.required).toBe(true);
    expect(inputNode.disabled).toBe(true);
  });

  it("should call onChange with toggled value on trigger click", () => {
    const onChange = vi.fn();
    const { trigger, hiddenInput: input } = BuildSwitch({
      name: "testCheckbox",
      value: "testValue",
      checked: false,
      onChange,
    });

    const triggerNode = document.createElement("button");
    const inputNode = document.createElement("input");

    trigger(triggerNode);
    input(inputNode);

    triggerNode.click();
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it("should call onChange with toggled value on trigger keydown (Enter)", () => {
    const onChange = vi.fn();
    const { trigger, hiddenInput: input } = BuildSwitch({
      name: "testCheckbox",
      value: "testValue",
      checked: false,
      onChange,
    });

    const triggerNode = document.createElement("button");
    const inputNode = document.createElement("input");

    trigger(triggerNode);
    input(inputNode);

    const event = new KeyboardEvent("keydown", { key: "Enter" });
    triggerNode.dispatchEvent(event);
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it("should call onChange with toggled value on trigger keydown (Space)", () => {
    const onChange = vi.fn();
    const { trigger, hiddenInput: input } = BuildSwitch({
      name: "testCheckbox",
      value: "testValue",
      checked: false,
      onChange,
    });

    const triggerNode = document.createElement("button");
    const inputNode = document.createElement("input");

    trigger(triggerNode);
    input(inputNode);

    const event = new KeyboardEvent("keydown", { key: " " });
    triggerNode.dispatchEvent(event);
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it("should not call onChange on trigger keydown with other keys", () => {
    const onChange = vi.fn();
    const { trigger, hiddenInput: input } = BuildSwitch({
      name: "testCheckbox",
      value: "testValue",
      checked: false,
      onChange,
    });

    const triggerNode = document.createElement("button");
    const inputNode = document.createElement("input");

    trigger(triggerNode);
    input(inputNode);

    const event = new KeyboardEvent("keydown", { key: "Escape" });
    triggerNode.dispatchEvent(event);
    expect(onChange).not.toHaveBeenCalled();
  });

  it("should set aria-checked correctly based on checked prop", () => {
    const { trigger: triggerChecked } = BuildSwitch({
      name: "testCheckbox",
      value: "testValue",
      checked: true,
    });

    const triggerCheckedNode = document.createElement("button");
    const inputCheckedNode = document.createElement("input");

    triggerChecked(triggerCheckedNode);
    inputCheckedNode.checked = true;

    expect(triggerCheckedNode.getAttribute("aria-checked")).toBe("true");

    const { trigger: triggerUnchecked } = BuildSwitch({
      name: "testCheckbox",
      value: "testValue",
      checked: false,
    });

    const triggerUncheckedNode = document.createElement("button");
    const inputUncheckedNode = document.createElement("input");

    triggerUnchecked(triggerUncheckedNode);
    inputUncheckedNode.checked = false;

    expect(triggerUncheckedNode.getAttribute("aria-checked")).toBe("false");
  });

  it("should set aria-required correctly based on required prop", () => {
    const { trigger: triggerRequired } = BuildSwitch({
      name: "testCheckbox",
      value: "testValue",
      required: true,
    });

    const triggerRequiredNode = document.createElement("button");
    triggerRequired(triggerRequiredNode);
    expect(triggerRequiredNode.getAttribute("aria-required")).toBe("true");

    const { trigger: triggerNotRequired } = BuildSwitch({
      name: "testCheckbox",
      value: "testValue",
      required: false,
    });

    const triggerNotRequiredNode = document.createElement("button");
    triggerNotRequired(triggerNotRequiredNode);
    expect(triggerNotRequiredNode.getAttribute("aria-required")).toBeNull();
  });

  it("should clean up event listeners on destroy", () => {
    const onChange = vi.fn();
    const { trigger, hiddenInput: input } = BuildSwitch({
      name: "testCheckbox",
      value: "testValue",
      checked: false,
      onChange,
    });

    const triggerNode = document.createElement("button");
    const inputNode = document.createElement("input");

    const triggerEffect = trigger(triggerNode);
    const inputEffect = input(inputNode);

    triggerNode.click();
    expect(onChange).toHaveBeenCalledWith(true);

    triggerEffect.destroy();
    inputEffect.destroy();
    onChange.mockClear();

    triggerNode.click();
    expect(onChange).not.toHaveBeenCalled();
  });

  it("should change attributes on update", () => {
    vi.useFakeTimers();
    let checked = false;
    const onChange = (c: boolean) => {
      checked = c;
    };
    const { trigger, hiddenInput: input } = BuildSwitch({
      name: "testCheckbox",
      value: "testValue",
      checked,
      onChange,
    });

    const triggerNode = document.createElement("button");
    const inputNode = document.createElement("input");

    const triggerEffect = trigger(triggerNode);
    const inputEffect = input(inputNode);

    expect(inputNode.checked).toBe(false);
    expect(triggerNode.getAttribute("data-state")).toBe("unchecked");

    triggerNode.click();

    triggerEffect.update({ checked });
    inputEffect.update({ checked });

    vi.advanceTimersToNextFrame();

    expect(inputNode.checked).toBe(true);
    expect(triggerNode.getAttribute("data-state")).toBe("checked");

    triggerEffect.destroy();
    inputEffect.destroy();
  });
});
