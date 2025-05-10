import { CustomSocketType } from "../types";

type SocketType = "string" | "exec" | "context" | "setting" | "image";

export function createSocket(socketType: SocketType): CustomSocketType {
  return new CustomSocketType(socketType);
}
