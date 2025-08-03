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
import { useStopWheel } from '../util/useStopWheel'

export interface ConsoleControlParams extends ControlOptions<any> {
  isOpen?: boolean
}

// なんか表示する用の用コントロール
export class ConsoleControl extends BaseControl<any, ConsoleControlParams> {
  value: string
  isOpen: boolean

  constructor(public params: ConsoleControlParams) {
    super(params)
    this.isOpen = params.isOpen ?? false
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
    this.value += addValue
    this.value += '\n-----------\n'
    this.notify()
  }
  setValue(value: string) {
    this.value = value
    this.notify()
  }
  getValue(): string {
    return this.value
  }
  override toJSON(): ControlJson {
    return {
      data: {
        value: this.value,
        isOpen: this.isOpen,
      },
    }
  }
  override setFromJSON({ data }: ControlJson): void {
    const { value, isOpen } = data as any
    this.value = value
    this.isOpen = isOpen
  }
}

export function ConsoleControlView(props: {
  data: ConsoleControl
}): JSX.Element {
  const value = useControlValue(props.data)
  const isOpen = useControlOpen(props.data)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  useStopWheel(textareaRef)

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
      <div className="flex flex-col w-full">
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
          <div className='flex-1'></div>
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
          <textarea
            ref={textareaRef}
            className="w-full h-full min-h-0 overflow-auto p-2 border-none resize-none text-sm text-gray-700 dark:text-gray-200 rounded-md bg-gray-100 focus:outline-none mt-1"
            value={value}
            readOnly
            rows={1}
          />
        )}
      </div>
    </Drag.NoDrag>
  )
}

export function useControlOpen(control: ConsoleControl): boolean {
  return useSyncExternalStore(
    cb => control.subscribe(cb),
    () => control.isConsoleOpen()
  )
}
