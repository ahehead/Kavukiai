import { useEffect } from "react"

export function useDragEdgeAutoscroll(ref: React.RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    const el = ref.current
    if (!el) return

    let ticking = false
    let dragging = false

    const onPointerMove = (ev: PointerEvent) => {
      if (!dragging) return
      const r = el.getBoundingClientRect()
      const margin = 24   // 端から何pxでスクロール開始
      const speed = 18    // 1フレームあたりのスクロール量(px)

      let dy = 0
      if (ev.clientY < r.top + margin) dy = -speed
      else if (ev.clientY > r.bottom - margin) dy = speed

      if (dy !== 0 && !ticking) {
        ticking = true
        requestAnimationFrame(() => {
          el.scrollTop += dy
          ticking = false
        })
      }
    }

    const onPointerDown = (ev: PointerEvent) => {
      dragging = true
      // キャンバスに渡さない
      ev.stopPropagation()
      window.addEventListener("pointermove", onPointerMove, { passive: true })
      window.addEventListener("pointerup", onPointerUp, { once: true })
    }

    const onPointerUp = () => {
      dragging = false
      window.removeEventListener("pointermove", onPointerMove)
    }

    el.addEventListener("pointerdown", onPointerDown)
    return () => {
      el.removeEventListener("pointerdown", onPointerDown)
      window.removeEventListener("pointermove", onPointerMove)
    }
  }, [ref])
}
