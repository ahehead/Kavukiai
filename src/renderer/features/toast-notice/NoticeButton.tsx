
import { useEffect, useState } from "react";
import { useNoticeStore } from "./useNoticeStore";
import type { Notice } from "./types";
import { BellButton } from "renderer/components/UIButton";
import { Popover, PopoverContent, PopoverTrigger } from "renderer/components/ui/popover";

export default function NoticeButton() {
  const notices = useNoticeStore((s) => s.list);
  const markAllRead = useNoticeStore((s) => s.markAllRead);
  const unread = notices.filter((n) => !n.read).length;

  const [open, setOpen] = useState(false);

  const toggle = () => {
    markAllRead();
    setOpen((o) => !o);
  };


  // Escキーで閉じる
  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
      }
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <BellButton haveUnread={unread > 0} onClick={toggle} />
      </PopoverTrigger>
      <PopoverContent className="max-h-80 overflow-y-scroll bg-transparent border-0">
        <div className="w-full h-full">
          <ul className="w-full">
            {notices.map((n: Notice) => (
              <li key={n.id} className="border-b my-1.5 bg-background rounded-md px-2 py-1 shadow-sm">
                <span className="text-xs">{n.kind}</span>
                <time className="text-xs text-gray-400 ml-2">
                  {new Date(n.createdAt).toLocaleTimeString()}
                </time>
                <p className="text-sm">{n.message}</p>
              </li>
            ))}
          </ul>
        </div>
      </PopoverContent>
    </Popover>
  );
}
