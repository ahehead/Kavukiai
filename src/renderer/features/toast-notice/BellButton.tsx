import { Bell, BellPlus } from "lucide-react";
import ScrollWindow from "./ScrollWindow";
import { useNoticeStore } from "./useNoticeStore";

export default function BellButton() {
  const notices = useNoticeStore((s) => s.list);
  const markAllRead = useNoticeStore((s) => s.markAllRead);
  const unread = notices.filter((n) => !n.read).length;

  return (
    <ScrollWindow
      onOpen={markAllRead}
      trigger={
        <button className='flex items-center justify-center rounded-full w-6 h-6 hover:bg-gray-300 mr-1'        >
          {unread > 0 ? (
            <BellPlus className='w-4 h-4' />
          ) : (<Bell className='w-4 h-4' />)}

        </button>
      }
    >
      <ul className="max-h-80 w-80">
        {notices.map((n) => (
          <li key={n.id} className="border-b px-4 py-2">
            <span className="font-semibold capitalize">{n.kind}</span>
            <time className="ml-2 text-xs text-gray-400">
              {new Date(n.createdAt).toLocaleTimeString()}
            </time>
            <p>{n.message}</p>
          </li>
        ))}
      </ul>
    </ScrollWindow>
  );
}
