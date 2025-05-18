import { CustomSocketType } from "../types";

type SocketType =
  | "string"
  | "boolean"
  | "number"
  | "array"
  | "exec"
  | "setting"
  | "image"
  | "OpenAIResponseParam"
  | "chatContext";

export function createSocket(socketType: SocketType): CustomSocketType {
  return new CustomSocketType(socketType);
}
