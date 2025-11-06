import { produce } from "immer";
import type { UChat, UChatMessage } from "@nodes/Chat/common/schema";
import { newMsgId } from "renderer/nodeEditor/nodes/util/newId";

export class ChatStore {
  private _messages: UChat;

  constructor(initial: UChat = []) {
    this._messages = initial.map((m) => (m.id ? m : { ...m, id: newMsgId() }));
  }

  get value(): UChat {
    return this._messages;
  }

  setAll(next: UChat): void {
    this._messages = next.map((m) => (m.id ? m : { ...m, id: newMsgId() }));
  }

  add(msg: UChatMessage): void {
    this._messages = produce(this._messages, (draft) => {
      draft.push(msg.id ? msg : { ...msg, id: newMsgId() });
    });
  }

  removeAt(index: number): void {
    this._messages = produce(this._messages, (draft) => {
      draft.splice(index, 1);
    });
  }

  modifyAt(index: number, next: UChatMessage): void {
    this._messages = produce(this._messages, (draft) => {
      draft[index] = next;
    });
  }

  clear(): void {
    this._messages = [];
  }

  withSystemPrompt(text: string): UChat {
    return [
      { id: newMsgId(), role: "system", content: [{ type: "text", text }] },
      ...this._messages,
    ];
  }
}
