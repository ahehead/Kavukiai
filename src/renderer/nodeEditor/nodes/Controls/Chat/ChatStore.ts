import { produce } from "immer";
import type {
  UChat,
  UChatMessage,
} from "renderer/nodeEditor/types/Schemas/UChat";
import { newMsgId } from "../../util/newId";

export class ChatStore {
  private _messages: UChat;
  constructor(initial: UChat = []) {
    this._messages = initial.map((m) => (m.id ? m : { ...m, id: newMsgId() }));
  }
  get value(): UChat {
    return this._messages;
  }

  setAll(next: UChat) {
    this._messages = next.map((m) => (m.id ? m : { ...m, id: newMsgId() }));
  }

  add(msg: UChatMessage) {
    this._messages = produce(this._messages, (draft) => {
      draft.push(msg.id ? msg : { ...msg, id: newMsgId() });
    });
  }
  removeAt(index: number) {
    this._messages = produce(this._messages, (draft) => {
      draft.splice(index, 1);
    });
  }
  modifyAt(index: number, next: UChatMessage) {
    this._messages = produce(this._messages, (draft) => {
      draft[index] = next;
    });
  }
  clear() {
    this._messages = [];
  }

  withSystemPrompt(text: string): UChat {
    return [
      { id: newMsgId(), role: "system", content: [{ type: "text", text }] },
      ...this._messages,
    ];
  }
}
