export type PressedType = "None" | "Add" | "Toggle";

export function accumulateOnShift() {
  let pressed: PressedType = "None";

  function keydown(e: KeyboardEvent) {
    if (e.key === "Shift") pressed = "Add";
    else if (e.key === "Control" || e.key === "Meta") pressed = "Toggle";
    else pressed = "None";
  }
  function keyup(e: KeyboardEvent) {
    if (e.key === "Shift") pressed = "None";
    else if (e.key === "Control" || e.key === "Meta") pressed = "None";
  }

  document.addEventListener("keydown", keydown);
  document.addEventListener("keyup", keyup);

  return {
    active: (): PressedType => pressed,
    destroy() {
      document.removeEventListener("keydown", keydown);
      document.removeEventListener("keyup", keyup);
    },
  };
}
