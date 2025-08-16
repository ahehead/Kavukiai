import { cva } from 'class-variance-authority'
import { BrushCleaning, ChevronRight } from 'lucide-react'
import { type JSX, useLayoutEffect, useRef, useSyncExternalStore } from 'react'
import {
  BaseControl,
  type ControlOptions,
  useControlValue,
} from 'renderer/nodeEditor/types'
import { Drag } from 'rete-react-plugin'
import type { ControlJson } from 'shared/JsonType'
import { useDragEdgeAutoscroll } from '../../util/useDragEdgeAutoscroll'
import { useStopWheel } from '../../util/useStopWheel'
import { MonacoLog } from './MonacoLog'

export interface ConsoleControlParams extends ControlOptions<any> {
  isOpen?: boolean
}

// なんか表示する用の用コントロール
export class ConsoleControl extends BaseControl<any, ConsoleControlParams> {
  value: string
  isOpen: boolean
  // 追加: 内部ログ配列（行ごと + 連続回数）
  private logs: { msg: string; count: number }[] = []
  private dirty = false // value 再生成が必要か
  private static readonly SEPARATOR = '\n-----------\n'
  private static readonly MAX_ENTRIES = 2000 // 上限（必要なら調整）
  private lastMessage: string | null = null // 互換用（UI 他で参照されている場合に備え保持）
  private repeatCount = 1

  constructor(public params: ConsoleControlParams) {
    super(params)
    this.isOpen = params.isOpen ?? true
    this.value = ''
  }

  toggle() {
    this.isOpen = !this.isOpen
    this.notify()
  }

  isConsoleOpen() {
    return this.isOpen
  }

  addValue: (addValue: string) => void = addValue => {
    if (!addValue) return

    const last = this.logs[this.logs.length - 1]
    if (last && last.msg === addValue) {
      last.count++
      this.repeatCount = last.count
    } else {
      this.logs.push({ msg: addValue, count: 1 })
      this.lastMessage = addValue
      this.repeatCount = 1
      // 上限超過を早期トリム（古いものを捨てる）
      if (this.logs.length > ConsoleControl.MAX_ENTRIES) {
        const overflow = this.logs.length - ConsoleControl.MAX_ENTRIES
        this.logs.splice(0, overflow)
      }
    }
    this.dirty = true
    this.notify()
  }
  setValue(value: string) {
    // 外部から直接設定（クリア等）
    this.value = value
    this.logs = []
    if (value) {
      const parts = value.split(ConsoleControl.SEPARATOR).filter(p => p)
      for (const p of parts) {
        const m = p.match(/^(.*) \(x(\d+)\)$/)
        if (m) this.logs.push({ msg: m[1], count: Number(m[2]) })
        else this.logs.push({ msg: p, count: 1 })
      }
    }
    const last = this.logs[this.logs.length - 1]
    this.lastMessage = last ? last.msg : null
    this.repeatCount = last ? last.count : 1
    this.dirty = false
    this.notify()
  }
  getValue(): string {
    if (this.dirty) {
      // 再構築（線形）: logs が上限管理されているので負荷軽減
      this.value = this.logs
        .map(l => (l.count > 1 ? `${l.msg} (x${l.count})` : l.msg))
        .join(ConsoleControl.SEPARATOR)
      if (this.value) this.value += ConsoleControl.SEPARATOR
      this.dirty = false
    }
    return this.value
  }
  override toJSON(): ControlJson {
    return {
      data: {
        value: this.getValue(),
        isOpen: this.isOpen,
        // 互換: lastMessage / repeatCount も保存
        lastMessage: this.lastMessage,
        repeatCount: this.repeatCount,
      },
    }
  }
  override setFromJSON({ data }: ControlJson): void {
    const { value, isOpen } = data as any
    this.isOpen = isOpen ?? false
    this.setValue(value ?? '')
  }
}

export function ConsoleControlView(props: {
  data: ConsoleControl
}): JSX.Element {
  const value = useControlValue(props.data)
  const isOpen = useSyncExternalStore(
    cb => props.data.subscribe(cb),
    () => props.data.isConsoleOpen()
  )
  const textareaRef = useRef<HTMLDivElement>(null)
  useStopWheel(textareaRef)
  useDragEdgeAutoscroll(textareaRef)

  useLayoutEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.scrollTop = textareaRef.current.scrollHeight
    }
  }, [value])

  const toggle = () => props.data.toggle()
  // valueをクリアする関数
  const clearValue = () => {
    props.data.setValue('')
  }

  return (
    <Drag.NoDrag>
      <div className="flex flex-col w-full h-full">
        <div className="flex items-center">
          <button
            type="button"
            className="flex items-center cursor-pointer"
            onClick={toggle}
          >
            <ChevronRight
              className={cva('transition-transform', {
                variants: {
                  open: {
                    true: 'rotate-90',
                  },
                },
              })({ open: isOpen })}
              size={16}
            />
            <span className="text-sm ml-1">Console</span>
          </button>
          <div className="flex-1"></div>
          <button
            type="button"
            className="ml-2 p-1 rounded bg-node-bg text-gray-500 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 dark:border-gray-600 hover:text-gray-700 dark:text-gray-200 transition flex items-center justify-center"
            onClick={clearValue}
            aria-label="コンソールをクリア"
            title="コンソールをクリア"
          >
            <BrushCleaning size={14} />
          </button>
        </div>
        {isOpen && (
          <div className="flex-1 min-h-0">
            <MonacoLog value={value} />
          </div>
        )}
      </div>
    </Drag.NoDrag>
  )
}

