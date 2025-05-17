import { CustomSocketType } from "../types";

type SocketType =
  | "string"
  | "exec"
  | "context"
  | "setting"
  | "image"
  | "OpenAIResponseParam";

export function createSocket(socketType: SocketType): CustomSocketType {
  return new CustomSocketType(socketType);
}
