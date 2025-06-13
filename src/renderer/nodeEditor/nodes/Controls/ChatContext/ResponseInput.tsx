import { useState, type JSX } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Pencil, Trash2, Check, X } from "lucide-react";
import { BaseControl, type ControlOptions } from "renderer/nodeEditor/types";
import type {
  ChatMessageItem,
  ResponseInputContent,
  ResponseInputText,
  ResponseInputImage,
  ResponseInputFile,
  ResponseInputAudio,
  ResponseInputItem,
} from "renderer/nodeEditor/types/Schemas/InputSchemas";

export interface ResponseInputMessageControlParams
  extends ControlOptions<ChatMessageItem[]> {
  value: ChatMessageItem[];
}

export class ResponseInputMessageControl extends BaseControl<ChatMessageItem[], ResponseInputMessageControlParams> {
  messages: ChatMessageItem[];
  totalTokens = 0;

  constructor(options: ResponseInputMessageControlParams) {
    super(options);
    this.messages = options.value ?? [];
  }

  setValue(value: ChatMessageItem[]): void {
    this.messages = value;
    this.opts.onChange?.(value);
  }

  getValue(): ChatMessageItem[] {
    return this.messages;
  }

  setSystemPrompt(text: string): void {
    const prev = [...this.messages];
    const idx = this.messages.findIndex((m) => m.role === "system");
    if (idx >= 0) {
      this.messages[idx] = {
        ...this.messages[idx],
        content: [{ type: "input_text", text }],
      };
    } else {
      this.messages.unshift({
        id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
        role: "system",
        type: "message",
        content: [{ type: "input_text", text }],
      });
    }
    this.addHistory(prev, this.messages);
    this.opts.onChange?.(this.messages);
  }

  addNewMessage(msg: ChatMessageItem): void {
    const prev = [...this.messages];
    this.messages.push(msg);
    this.addHistory(prev, this.messages);
    this.opts.onChange?.(this.messages);
  }

  setState(index: number, msg: ChatMessageItem): void {
    const prev = [...this.messages];
    this.messages[index] = msg;
    this.addHistory(prev, this.messages);
    this.opts.onChange?.(this.messages);
  }

  clear(): void {
    const prev = [...this.messages];
    this.messages = [];
    this.addHistory(prev, this.messages);
    this.opts.onChange?.(this.messages);
  }

  getLastMessage(): ChatMessageItem | undefined {
    return this.messages[this.messages.length - 1];
  }

  removeMessage(index: number): void {
    const prev = [...this.messages];
    this.messages.splice(index, 1);
    this.addHistory(prev, this.messages);
    this.opts.onChange?.(this.messages);
  }
}

export function ResponseInputMessageView(props: { data: ResponseInputMessageControl }): JSX.Element {
  const control = props.data;
  const [messages, setMessages] = useState(control.getValue());
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [editText, setEditText] = useState("");

  const refresh = () => setMessages([...control.getValue()]);

  const startEdit = (index: number) => {
    const msg = control.getValue()[index];
    const text = msg.content
      .map((c) => (isContentText(c) ? c.text : ""))
      .join("\n");
    setEditText(text);
    setEditIndex(index);
  };

  const saveEdit = () => {
    if (editIndex === null) return;
    const msg = control.getValue()[editIndex];
    const updated: ChatMessageItem = {
      ...msg,
      content: [{ type: "input_text", text: editText }],
    };
    control.setState(editIndex, updated);
    setEditIndex(null);
    refresh();
  };

  const cancelEdit = () => setEditIndex(null);

  const deleteMsg = (index: number) => {
    control.removeMessage(index);
    refresh();
  };

  return (
    <div className="space-y-2">
      {messages.map((msg, index) => (
        <div key={msg.id} className="relative border rounded p-2">
          {editIndex === index ? (
            <div>
              <textarea
                className="w-full border mb-1"
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
              />
              <div className="flex justify-end gap-1">
                <Check size={14} className="cursor-pointer" onClick={saveEdit} />
                <X size={14} className="cursor-pointer" onClick={cancelEdit} />
              </div>
            </div>
          ) : (
            <>
              <strong className="block mb-1">{msg.role}</strong>
              <div>
                {msg.content.map((contentItem, idx) => {
                  return (
                    <div key={`${contentItem.type}-${idx}`} className="mb-1">
                      {isContentText(contentItem) && (
                        <Markdown remarkPlugins={[remarkGfm]}>{contentItem.text}</Markdown>
                      )}
                      {isContentImage(contentItem) && contentItem.image_url && (
                        <img src={contentItem.image_url} alt="message-image" />
                      )}
                      {isContentFile(contentItem) && contentItem.filename && (
                        <a
                          href={`data:application/octet-stream;base64,${contentItem.file_data}`}
                          download={contentItem.filename}
                        >
                          {contentItem.filename}
                        </a>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}
          <div className="absolute right-1 bottom-1 flex gap-1 text-xs">
            <Pencil size={14} className="cursor-pointer" onClick={() => startEdit(index)} />
            <Trash2 size={14} className="cursor-pointer" onClick={() => deleteMsg(index)} />
          </div>
        </div>
      ))}
    </div>
  );
}

function isContentText(item: ResponseInputContent): item is ResponseInputText {
  return item.type === "input_text";
}
function isContentImage(item: ResponseInputContent): item is ResponseInputImage {
  return item.type === "input_image";
}
function isContentFile(item: ResponseInputContent): item is ResponseInputFile {
  return item.type === "input_file";
}
function isItemAudio(item: ResponseInputItem): item is ResponseInputAudio {
  return item.type === "input_audio";
}
