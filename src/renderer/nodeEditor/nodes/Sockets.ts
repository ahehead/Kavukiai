import { ClassicPreset } from "rete";

// テキスト専用ソケット
export class StringSocket extends ClassicPreset.Socket {
  constructor() {
    super("string");
  }
  isCompatibleWith(socket: ClassicPreset.Socket): boolean {
    return socket instanceof StringSocket;
  }
}

// 実行トリガー用ソケット
export class ExecSocket extends ClassicPreset.Socket {
  constructor() {
    super("exec");
  }
  isCompatibleWith(socket: ClassicPreset.Socket): boolean {
    return socket instanceof ExecSocket;
  }
}

// チャットコンテキスト用ソケット
export class ContextSocket extends ClassicPreset.Socket {
  constructor() {
    super("context");
  }
  isCompatibleWith(socket: ClassicPreset.Socket): boolean {
    return socket instanceof ContextSocket;
  }
}

// 設定用ソケット
export class SettingSocket extends ClassicPreset.Socket {
  constructor() {
    super("setting");
  }
  isCompatibleWith(socket: ClassicPreset.Socket): boolean {
    return socket instanceof SettingSocket;
  }
}

// 画像用ソケット
export class ImageSocket extends ClassicPreset.Socket {
  constructor() {
    super("image");
  }
  isCompatibleWith(socket: ClassicPreset.Socket): boolean {
    return socket instanceof ImageSocket;
  }
}
