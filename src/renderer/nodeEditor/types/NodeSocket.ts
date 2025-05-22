import { ClassicPreset } from "rete";

export class NodeSocket extends ClassicPreset.Socket {
  isConnected = false;

  constructor(name: string, isConnect = false) {
    super(name);
    this.isConnected = isConnect;
  }

  isCompatibleWith(socket: NodeSocket): boolean {
    return this.name === socket.name;
  }

  setConnected(isConnect: boolean) {
    this.isConnected = isConnect;
  }
}

export type NodeSocketType =
  | "string"
  | "boolean"
  | "number"
  | "array"
  | "exec"
  | "setting"
  | "image"
  | "OpenAIParam"
  | "chatContext";

export function createSocket(socketType: NodeSocketType): NodeSocket {
  return new NodeSocket(socketType);
}
