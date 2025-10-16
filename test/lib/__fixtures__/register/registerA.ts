import { registerLog } from "./registerLog";

export function register() {
  registerLog.push("A");
  return "registerA";
}
