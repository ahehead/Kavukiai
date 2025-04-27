import { useRef } from 'react';
type Props = { onClose: () => void };

export default function SettingsModal({ onClose }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  const stop = (e: React.SyntheticEvent) => e.stopPropagation();

  return (
    <div
      className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={onClose}
      onKeyDown={stop}
      onKeyUp={stop}
    >
      <dialog
        open
        ref={dialogRef}
        className="static bg-white p-6 rounded-lg shadow-lg dialog-animate focus:outline-none"
        onClick={stop}
        onKeyDown={stop}
        onKeyUp={stop}
      >
        <h2 className="text-xl font-bold mb-4 ">設定</h2>
        {/* 設定 UI をここに配置 */}
        <button
          type="button"
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring"
          onClick={onClose}
        >
          閉じる
        </button>
      </dialog>
    </div>
  );
}
