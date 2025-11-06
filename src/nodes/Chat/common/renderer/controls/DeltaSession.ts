import type { UChatMessage } from "@nodes/Chat/common/schema";
import { newMsgId } from "renderer/nodeEditor/nodes/util/newId";
import type { ChatStore } from "./ChatStore";

export class DeltaSession {
  private inFlight = false;
  private index = -1;
  private buffer = "";

  constructor(private readonly store: ChatStore) {}

  start(initial?: Partial<UChatMessage>): void {
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
    this.store.add(base);
  }

  setInfo(info: Partial<UChatMessage>): void {
    const msg = this.store.value[this.index];
    if (!this.inFlight || !msg) return;
    this.store.modifyAt(this.index, { ...msg, ...info });
  }

  delta(chunk: string): void {
    if (!this.inFlight) return;
    const msg = this.store.value[this.index];
    if (!msg || msg.role !== "assistant") return;
    this.buffer += chunk;
    this.store.modifyAt(this.index, {
      ...msg,
      content: [{ type: "text", text: this.buffer }],
    });
  }

  finish(text?: string, message?: Partial<UChatMessage>): void {
    if (!this.inFlight) return;
    const msg = this.store.value[this.index];
    if (msg) {
      const next: UChatMessage = { ...msg, ...message };
      if (text !== undefined) next.content = [{ type: "text", text }];
      this.store.modifyAt(this.index, next);
    }
    this.inFlight = false;
    this.index = -1;
    this.buffer = "";
  }

  get streamingIndex(): number | null {
    return this.index >= 0 ? this.index : null;
  }
}
