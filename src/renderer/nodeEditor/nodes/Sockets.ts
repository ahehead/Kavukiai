import { CustomSocketType } from "../types";

// テキスト専用ソケット
export class StringSocket extends CustomSocketType {
  constructor() {
    super("string");
    this.type = "string";
  }
  isCompatibleWith(socket: CustomSocketType): boolean {
    return socket instanceof StringSocket;
  }
}

// 実行トリガー用ソケット
export class ExecSocket extends CustomSocketType {
  constructor() {
    super("exec");
    this.type = "exec";
  }
  isCompatibleWith(socket: CustomSocketType): boolean {
    return socket instanceof ExecSocket;
  }
}

// チャットコンテキスト用ソケット
export class ContextSocket extends CustomSocketType {
  constructor() {
    super("context");
    this.type = "context";
  }
  isCompatibleWith(socket: CustomSocketType): boolean {
    return socket instanceof ContextSocket;
  }
}

// 設定用ソケット
export class SettingSocket extends CustomSocketType {
  constructor() {
    super("setting");
    this.type = "setting";
  }
  isCompatibleWith(socket: CustomSocketType): boolean {
    return socket instanceof SettingSocket;
  }
}

// 画像用ソケット
export class ImageSocket extends CustomSocketType {
  constructor() {
    super("image");
    this.type = "image";
  }
  isCompatibleWith(socket: CustomSocketType): boolean {
    return socket instanceof ImageSocket;
  }
}
