import { useState, useRef, useEffect, useLayoutEffect, type JSX } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Pencil, Trash2, Check, X, GitBranch, Copy } from "lucide-react";
import { BaseControl, useControlValue, type ControlOptions } from "renderer/nodeEditor/types";
import type {
  ResponseInputContent,
  ResponseInputText,
  ResponseInputImage,
  ResponseInputFile,
} from "renderer/nodeEditor/types/Schemas/InputSchemas";
import type { ChatMessageItem } from "renderer/nodeEditor/types/Schemas";
import { Drag } from "rete-react-plugin";


export interface ResponseInputMessageControlParams
  extends ControlOptions<ChatMessageItem[]> {
  value: ChatMessageItem[];
}

export class ResponseInputMessageControl extends BaseControl<ChatMessageItem[], ResponseInputMessageControlParams> {
  messages: ChatMessageItem[];
  totalTokens = 0;
  messageTemp = "";

  constructor(options: ResponseInputMessageControlParams) {
    super(options);
    this.messages = options.value ?? [];
  }

  setValue(value: ChatMessageItem[]): void {
    this.messages = value;
    this.opts.onChange?.(value);
    this.notify();
  }

  getValue(): ChatMessageItem[] {
    return this.messages;
  }

  setSystemPrompt(text: string): void {
    const prev = [...this.messages];
    const idx = this.messages.findIndex((m) => m.role === "system");
    const next = [...this.messages];
    if (idx >= 0) {
      next[idx] = {
        ...next[idx],
        content: [{ type: "input_text", text }],
      };
    } else {
      next.unshift({
        role: "system",
        type: "message",
        content: [{ type: "input_text", text }],
      });
    }
    this.messages = next;
    this.addHistory(prev, this.messages);
    this.opts.onChange?.(this.messages);
    this.notify();
  }

  addMessage(msg: ChatMessageItem): void {
    const prev = [...this.messages];
    this.messages = [...this.messages, msg];
    this.addHistory(prev, this.messages);
    this.opts.onChange?.(this.messages);
    this.notify();
  }

  // 一時的にMessageを追加して、indexを返す
  addTempMessage(msg: ChatMessageItem): number {
    this.messages = [...this.messages, msg];
    return this.messages.length - 1;
  }

  // 一時messageのroleとidを設定する
  setTempMessageRoleAndId(index: number, role: ChatMessageItem["role"], id: string): void {
    const message = this.messages[index];
    if (message) {
      message.role = role;
      message.id = id;
      this.messages = [...this.messages];
      this.notify();
    } else {
      console.error(`Message at index ${index} not found.`);
    }
  }

  // indexのメッセージの内容をdeltaで書き換えていく
  modifyMessageTextDelta(index: number, deltaString: string): void {
    this.messageTemp += deltaString;
    const message = this.messages[index];
    if (message && message.content[0].type === "input_text") {
      message.content[0].text = this.messageTemp;
      this.messages = [...this.messages];
    }
    this.notify();
  }
  // indexのメッセージの内容をtextで確定する
  modifyMessageTextDone(index: number, text: string): void {
    this.messageTemp = "";
    const message = this.messages[index];
    if (message && message.content[0].type === "input_text") {
      message.content[0].text = text;
      this.messages = [...this.messages];
      this.addHistory(this.messages, this.messages);
      this.opts.onChange?.(this.messages);
      this.notify();
    }
  }

  modifyChatMessage(index: number, msg: ChatMessageItem): void {
    const prev = [...this.messages];
    const next = [...this.messages];
    next[index] = msg;
    this.messages = next;
    this.addHistory(prev, next);
    this.opts.onChange?.(next);
    this.notify();
  }

  clear(): void {
    const prev = [...this.messages];
    this.messages = [];
    this.addHistory(prev, this.messages);
    this.opts.onChange?.(this.messages);
    this.notify();
  }

  getLastMessage(): ChatMessageItem | undefined {
    return this.messages[this.messages.length - 1];
  }

  getById(id: string): ChatMessageItem | undefined {
    return this.messages.find((msg) => msg.id === id);
  }

  removeMessage(index: number): void {
    const prev = [...this.messages];
    const next = [...this.messages];
    next.splice(index, 1);
    this.messages = next;
    this.addHistory(prev, next);
    this.opts.onChange?.(next);
    this.notify();
  }

  removeSystemPrompts(): void {
    const prev = [...this.messages];
    this.messages = excludeSystemPrompts(this.messages);
    this.addHistory(prev, this.messages);
    this.opts.onChange?.(this.messages);
    this.notify();
  }
}

export function ResponseInputMessageView(props: { data: ResponseInputMessageControl }): JSX.Element {
  const control = props.data;
  const messages = useControlValue<ChatMessageItem[]>(control);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [editText, setEditText] = useState("");
  // Ref for auto-resizing textarea in edit mode
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Adjust textarea height to fit content on editIndex or editText change
  useLayoutEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [editText, editIndex]);

  // メッセージが追加されたときに一番下までスクロール
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, [messages.length]);

  const startEdit = (index: number) => {
    const msg = messages[index];
    const text = msg.content
      .map((c) => (isContentText(c) ? c.text : ""))
      .join("\n");
    setEditText(text);
    setEditIndex(index);
  };

  const saveEdit = () => {
    if (editIndex === null) return;
    const msg = messages[editIndex];
    const updated: ChatMessageItem = {
      ...msg,
      content: [{ type: "input_text", text: editText }],
    };
    control.modifyChatMessage(editIndex, updated);
    setEditIndex(null);
  };

  const cancelEdit = () => setEditIndex(null);

  const deleteMsg = (index: number) => {
    control.removeMessage(index);
  };

  return (
    <Drag.NoDrag>
      <div ref={scrollContainerRef} className="flex-1 w-full h-full min-h-0 overflow-y-auto">
        {messages.length === 0 && (
          <div className="w-full flex items-center justify-center ">
            <div className="p-3 text-gray-600">No messages</div>
          </div>
        )}
        {messages.map((msg, index) => (
          // Message Item
          <div key={index} className="rounded group">
            {/* Message Content Wrapper */}
            <div className="group-hover:bg-node-header/30 py-1.5 px-3">
              {/* role */}
              <strong className="block mb-1">{msg.role}</strong>
              {/* Edit Mode */}
              {editIndex === index ? (
                <div>
                  <textarea
                    className="w-full border mb-1"
                    ref={textareaRef}
                    style={{ overflow: 'hidden' }}
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                  />
                  <div className="flex justify-end gap-1">
                    <Check size={14} className="cursor-pointer" onClick={saveEdit} />
                    <X size={14} className="cursor-pointer" onClick={cancelEdit} />
                  </div>
                </div>
              ) : (
                // Normal View
                <div className="break-all">
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
              )}
            </div>
            {/* tool ボタン */}
            {msg.role !== 'system' && editIndex !== index && (
              <div className="flex justify-end items-center py-0.5">
                <div className={`flex gap-1 text-xs ${index !== messages.length - 1 ? 'opacity-0 group-hover:opacity-100 transition-opacity duration-200' : ''}`}>
                  <ToolButton icon={<GitBranch size={14} />} onClick={() => { }} />
                  <ToolButton icon={<Copy size={14} />} onClick={() => { }} />
                  <ToolButton icon={<Pencil size={14} />} onClick={() => startEdit(index)} />
                  <ToolButton icon={<Trash2 size={14} />} onClick={() => deleteMsg(index)} />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </Drag.NoDrag>
  );
}

function ToolButton({ icon, onClick, ...props }: { icon: JSX.Element, onClick: () => void } & React.HTMLProps<HTMLDivElement>): JSX.Element {
  return (
    <div className="w-[16px] h-[16px] flex items-center justify-center hover:bg-accent/80 rounded-sm" onClick={onClick} {...props}>
      {icon}
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


// Function to exclude system prompt messages from a list
export function excludeSystemPrompts(messages: ChatMessageItem[]): ChatMessageItem[] {
  return messages.filter((msg) => msg.role !== "system");
}
