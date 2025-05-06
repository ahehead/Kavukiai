import clsx from 'clsx'
import { Presets, type ClassicScheme, type RenderEmit } from 'rete-react-plugin'
import type { JSX } from 'react'
export const $nodecolor = 'rgba(110,136,255,0.8)'
export const $nodecolorselected = '#ffd92c'
export const $socketsize = 24
export const $socketmargin = 6
export const $socketcolor = '#96b38a'
export const $nodewidth = 180

type NodeExtraData = { width?: number, height?: number }

type Props<S extends ClassicScheme> = {
  data: S['Node'] & NodeExtraData
  styles?: () => any
  emit: RenderEmit<S>
}
export type NodeComponent<Scheme extends ClassicScheme> = (props: Props<Scheme>) => JSX.Element

export function Node<Scheme extends ClassicScheme>({ data, emit }: Props<Scheme>) {
  const inputs = Object.entries(data.inputs)
  const outputs = Object.entries(data.outputs)
  const controls = Object.entries(data.controls)
  const { id, label, width, height, selected = false } = data

  function sortByIndex<T extends [string, undefined | { index?: number }][]>(entries: T) {
    entries.sort((a, b) => (a[1]?.index || 0) - (b[1]?.index || 0))
  }
  sortByIndex(inputs)
  sortByIndex(outputs)
  sortByIndex(controls)

  return (
    <div
      data-testid="node"
      className={clsx(
        'relative cursor-pointer select-none rounded-[10px] border-2 pb-[6px] font-sans',
        'border-[#4e58bf] bg-[rgba(110,136,255,0.8)] hover:bg-[rgba(115,141,255,0.84)]',
        selected && 'bg-[#ffd92c] border-[#e3c000]'
      )}
      style={{
        width: `${Number.isFinite(width) ? width : 180}px`,
        height: Number.isFinite(height) ? `${height}px` : 'auto'
      }}
    >
      <div
        className="title text-white text-[18px] font-sans p-[8px]"
        data-testid="title"
      >
        {label}
      </div>

      {/* Outputs */}
      {outputs.map(([key, output]) =>
        output && (
          <div
            className="output text-right"
            key={key}
            data-testid={`output-${key}`}
          >
            <div
              className="output-title inline-block align-middle text-white text-[14px] font-sans m-[6px] leading-[24px]"
              data-testid="output-title"
            >
              {output.label}
            </div>
            <Presets.classic.RefSocket
              name="output-socket"
              side="output"
              socketKey={key}
              nodeId={id}
              emit={emit}
              payload={output.socket}
              data-testid="output-socket"
            />
          </div>
        )
      )}

      {/* Controls */}
      {controls.map(([key, control]) =>
        control ? (
          <Presets.classic.RefControl
            key={key}
            name="control"
            emit={emit}
            payload={control}
            data-testid={`control-${key}`}
          />
        ) : null
      )}

      {/* Inputs */}
      {inputs.map(([key, input]) =>
        input ? (
          <div
            className="input text-left"
            key={key}
            data-testid={`input-${key}`}
          >
            <Presets.classic.RefSocket
              name="input-socket"
              side="input"
              socketKey={key}
              nodeId={id}
              emit={emit}
              payload={input.socket}
              data-testid="input-socket"
            />
            {(!input.control || !input.showControl) && (
              <div
                className="input-title inline-block align-middle text-white text-[14px] font-sans m-[6px] leading-[24px]"
                data-testid="input-title"
              >
                {input.label}
              </div>
            )}
            {input.control && input.showControl && (
              <Presets.classic.RefControl
                key={key}
                name="input-control"
                emit={emit}
                payload={input.control}
                data-testid="input-control"
              />
            )}
          </div>
        ) : null
      )}
    </div>
  )
}
