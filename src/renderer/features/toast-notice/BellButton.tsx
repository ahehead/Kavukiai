import { Bell, BellPlus, X } from "lucide-react";
import { useEffect, useRef, useState, useId } from "react";
import { useNoticeStore } from "./useNoticeStore";
import type { Notice } from "./types";

export default function BellButton() {
  const notices = useNoticeStore((s) => s.list);
  const markAllRead = useNoticeStore((s) => s.markAllRead);
  const unread = notices.filter((n) => !n.read).length;

  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const id = useId();

  const toggle = () => {
    markAllRead();      // 開く前に既読化
    console.log("toggle", open);
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
    <div className="relative inline-block" ref={ref}>
      <button
        onClick={toggle}
        className="flex items-center justify-center rounded-full w-7 h-7 bg-gray-200 hover:bg-gray-300 mr-1 focus:outline-none"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={`${id}-panel`}
      >
        {unread > 0 ? <BellPlus className="w-5 h-5" /> : <Bell className="w-5 h-5" />}
      </button>

      {open && (
        <div
          id={`${id}-panel`}
          role="menu"
          className="absolute right-0 bottom-full mb-2 w-80 max-h-80 bg-background border shadow-lg rounded-md z-50 flex flex-col overflow-hidden"
        >
          <div className="flex justify-end p-1">
            <button
              onClick={() => setOpen(false)}
              className="p-1 hover:bg-gray-200 rounded"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="overflow-y-scroll overflow-x-hidden px-2 pb-2">
            <ul className="max-h-80 w-full">
              {notices.map((n: Notice) => (
                <li key={n.id} className="border-b px-4 py-2">
                  <span className="font-semibold capitalize">{n.kind}</span>
                  <time className="ml-2 text-xs text-gray-400">
                    {new Date(n.createdAt).toLocaleTimeString()}
                  </time>
                  <p>{n.message}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
