import { useEffect, useMemo } from 'react'
import {
  BaseControl,
  type ControlOptions,
  useControlValue,
} from 'renderer/nodeEditor/types'
import type { NodeImage } from 'renderer/nodeEditor/types/Schemas/NodeImage'
import { Drag } from 'rete-react-plugin'

// NodeImage[] を保持し、複数プレビューを表示するコントロール
export interface ImageControlOptions extends ControlOptions<NodeImage[]> {
  value?: NodeImage[]
}

export class ImageControl extends BaseControl<NodeImage[], ImageControlOptions> {
  // プレビュー用の画像リスト
  value: NodeImage[]
  constructor(options: ImageControlOptions = {}) {
    super(options)
    this.value = options.value ?? []
  }

  // 一括設定（置き換え）
  setValue(value: NodeImage[]) {
    this.value = Array.isArray(value) ? value : []
    this.notify()
  }

  // 取得
  getValue(): NodeImage[] {
    return this.value
  }

  // 末尾にプレビューを追加
  show(img: NodeImage) {
    this.value = [...this.value, img]
    this.notify()
  }

  // クリア
  clear() {
    if (this.value.length === 0) return
    this.value = []
    this.notify()
  }
}

export function ImageControlView(props: { data: ImageControl }) {
  const control = props.data
  const images = useControlValue(control)

  // 画像配列ごとに blob URL を生成し、次回変更時/アンマウント時にだけ破棄する
  const { urls, created } = useMemo(() => {
    const createdNow: string[] = []
    const mapToSrc = (img: NodeImage): string | null => {
      const src = img.source
      switch (src.kind) {
        case 'url':
          return src.url
        case 'path':
          return `file://${src.path}`
        case 'data': {
          const mime = img.mime ?? 'application/octet-stream'
          if (src.encoding === 'base64') return `data:${mime};base64,${src.data}`
          return `data:${mime},${encodeURIComponent(src.data)}`
        }
        case 'blob': {
          try {
            const url = URL.createObjectURL(src.blob as Blob)
            createdNow.push(url)
            return url
          } catch {
            return null
          }
        }
      }
      return null
    }
    return { urls: images.map(mapToSrc), created: createdNow }
  }, [images])

  // クリーンアップ: 直前レンダーで生成した URL だけを破棄
  useEffect(() => {
    return () => {
      for (const url of created) URL.revokeObjectURL(url)
    }
  }, [created])

  if (!images || images.length === 0)
    return (
      <Drag.NoDrag>
        <div className="w-full h-full bg-gray-200" />
      </Drag.NoDrag>
    )

  // 単一画像はコントロール領域いっぱいに表示、複数は3列グリッド
  if (images.length === 1) {
    const img = images[0]
    const src = urls[0]
    return (
      <Drag.NoDrag>
        <div className="w-full h-full overflow-hidden p-1">
          <div
            className="w-full h-full bg-gray-100 rounded overflow-hidden flex items-center justify-center"
            title={img.alt ?? ''}
          >
            {src ? (
              // 画像全体が見えるように object-contain（必要なら object-cover に変更）
              <img src={src} alt={img.alt ?? ''} className="w-full h-full object-contain" />
            ) : (
              <div className="text-xs text-gray-500">preview error</div>
            )}
          </div>
        </div>
      </Drag.NoDrag>
    )
  }

  return (
    <Drag.NoDrag>
      <div className="w-full h-full overflow-auto p-1">
        <div className="grid grid-cols-3 gap-1 auto-rows-fr">
          {images.map((img, i) => {
            const src = urls[i]
            return (
              <div
                key={img.id}
                className="w-full aspect-square bg-gray-100 rounded overflow-hidden flex items-center justify-center"
                title={img.alt ?? ''}
              >
                {src ? (
                  <img src={src} alt={img.alt ?? ''} className="object-cover w-full h-full" />
                ) : (
                  <div className="text-xs text-gray-500">preview error</div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </Drag.NoDrag>
  )
}
