import { ClassicPreset } from "rete";
import type { NodeInterface } from "../Schemes";

type Listener = () => void;
export class Connection<
  A extends NodeInterface,
  B extends NodeInterface
> extends ClassicPreset.Connection<A, B> {
  isLoop?: boolean;
  isExec?: boolean;
  /**
   * 接続の状態: 通常 or 型エラー
   * - "type-error": ソケット型の不一致などで無効
   * - "normal": 通常
   */
  _state: "normal" | "type-error" = "normal";

  get state() {
    return this._state;
  }

  changeTypeErrorState() {
    this._state = "type-error";
    this.notify();
  }

  changeNormalState() {
    this._state = "normal";
    this.notify();
  }

  private listeners = new Set<Listener>();

  notify() {
    for (const listener of this.listeners) {
      listener();
    }
  }
  subscribe(l: Listener) {
    this.listeners.add(l);
    return () => this.listeners.delete(l); // unsubscribe
  }
}
