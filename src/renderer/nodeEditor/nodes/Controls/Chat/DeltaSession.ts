import type { UChatMessage } from "renderer/nodeEditor/types/Schemas/UChat";
import { newMsgId } from "../../util/newId";
import type { ChatStore } from "./ChatStore";

export class DeltaSession {
  private inFlight = false;
  private index = -1;
  private buffer = "";

  constructor(private store: ChatStore) {}

  start(initial?: Partial<UChatMessage>) {
    if (this.inFlight) return;
    this.inFlight = true;
    this.buffer = "";
    const base: UChatMessage = {
      id: initial?.id ?? newMsgId(),
      role: "assistant",
      content: [{ type: "text", text: "" }],
      ...initial,
    };
    this.index = this.store.value.length;
    this.store.add(base); // 履歴は外側で
  }

  setInfo(info: Partial<UChatMessage>) {
    const msg = this.store.value[this.index];
    if (!this.inFlight || !msg) return;
    this.store.modifyAt(this.index, { ...msg, ...info });
  }

  delta(chunk: string) {
    if (!this.inFlight) return;
    const msg = this.store.value[this.index];
    if (!msg || msg.role !== "assistant") return;
    this.buffer += chunk;
    this.store.modifyAt(this.index, {
      ...msg,
      content: [{ type: "text", text: this.buffer }],
    });
  }

  finish(text?: string, message?: Partial<UChatMessage>) {
    if (!this.inFlight) return;
    const msg = this.store.value[this.index];
    if (msg) {
      const next: UChatMessage = { ...msg, ...message };
      if (text !== undefined) {
        next.content = [{ type: "text", text }];
      }
      this.store.modifyAt(this.index, next);
    }
    this.inFlight = false;
    this.index = -1;
    this.buffer = "";
  }

  get streamingIndex() {
    return this.index >= 0 ? this.index : null;
  }
}
