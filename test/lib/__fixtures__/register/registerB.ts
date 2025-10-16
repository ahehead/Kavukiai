import { registerLog } from "./registerLog";

export function register() {
  registerLog.push("B");
  return "registerB";
}
