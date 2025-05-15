import { useRef } from 'react';
type Props = { onClose: () => void };

export default function SettingsModal({ onClose }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  const stop = (e: React.SyntheticEvent) => e.stopPropagation();

  return (
    <div
      className="fixed inset-0 w-full h-full bg-accent/20 backdrop-blur-xs flex items-center justify-center z-modal"
      onClick={onClose}
      onKeyDown={stop}
      onKeyUp={stop}
    >
      <dialog
        open
        ref={dialogRef}
        className="static bg-background p-6 rounded-lg shadow-lg dialog-animate focus:outline-none"
        onClick={stop}
        onKeyDown={stop}
        onKeyUp={stop}
      >

      </dialog>
    </div>
  );
}
