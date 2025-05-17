import { useEffect } from "react";

/** `useNoDrag` のあとに wheel だけ止める */
export function useStopWheel(
  ref: React.RefObject<HTMLElement | null>,
  disabled?: boolean
) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const handleWheel = (e: WheelEvent) => {
      if (disabled) return;
      e.stopPropagation();
    };

    el.addEventListener("wheel", handleWheel, { passive: true }); // ブラウザの警告を出さないように

    return () => el.removeEventListener("wheel", handleWheel);
  }, [ref, disabled]);
}
