import { ClassicPreset } from "rete";

/**
 * ソケットクラスを動的に生成するファクトリ
 */
function createSocketClass(label: string) {
  return class extends ClassicPreset.Socket {
    constructor() {
      super(label);
    }
    // 自クラス同士だけ true
    isCompatibleWith(socket: ClassicPreset.Socket): boolean {
      return socket.constructor === this.constructor;
    }
  };
}

// 生成したクラス
export const StringSocket = createSocketClass("string");
export const ExecSocket = createSocketClass("exec");
export const ContextSocket = createSocketClass("context");
export const SettingSocket = createSocketClass("setting");
export const ImageSocket = createSocketClass("image");
