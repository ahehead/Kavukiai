import { X } from 'lucide-react';
import { useEffect, useRef, useState, useId } from 'react';

type Props = {
  trigger: React.ReactNode;
  children: React.ReactNode;
  onOpen?: () => void;
  onClose?: () => void;
};

export default function ScrollWindow({ trigger, children, onOpen, onClose }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const id = useId();

  // 外部クリックで閉じる
  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        onClose?.();
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [open, onClose]);

  // Escキーで閉じる
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        onClose?.();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const toggle = () => {
    setOpen((o) => {
      const next = !o;
      if (next) onOpen?.();
      return next;
    });
  };

  return (
    <div className="relative" ref={ref}>
      {/* biome-ignore lint/a11y/useKeyWithClickEvents: <explanation> */}
      <div
        onClick={toggle}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={`${id}-panel`}
      >
        {trigger}
      </div>
      {open && (
        <div
          id={`${id}-panel`}
          role="menu"
          className="absolute right-0 bottom-full mb-2 w-80 max-h-80 bg-white border shadow-lg rounded-md z-50 flex flex-col overflow-hidden"
        >
          <div className="flex justify-end p-1">
            <button onClick={() => { setOpen(false); onClose?.(); }} className="p-1 hover:bg-gray-200 rounded">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="overflow-y-scroll overflow-x-hidden px-2 pb-2">
            {children}
          </div>
        </div>
      )}
    </div>
  );
}
