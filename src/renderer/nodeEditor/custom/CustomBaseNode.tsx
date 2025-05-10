import { Presets, type RenderEmit } from 'rete-react-plugin'
import type { Node as NodeInterface, Schemes } from '../types'
import { NodePanel, NodePanelBody, NodePanelHeader, NodeTitle } from 'renderer/components/NodePanel'
export const $nodecolor = 'rgba(110,136,255,0.8)'
export const $nodecolorselected = '#ffd92c'
export const $socketsize = 24
export const $socketmargin = 6
export const $socketcolor = '#96b38a'
export const $nodewidth = 180

type NodeExtraData = { width?: number, height?: number }

type Props<S extends Schemes> = {
  data: NodeInterface & NodeExtraData
  styles?: () => any
  emit: RenderEmit<S>
}

export function Node<Scheme extends Schemes>({ data, emit }: Props<Scheme>) {
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
    <NodePanel

      style={{
        width: `${Number.isFinite(width) ? width : 180}px`,
        height: Number.isFinite(height) ? `${height}px` : 'auto'
      }}
    >
      <NodePanelHeader>
        <NodeTitle>{label}</NodeTitle>
      </NodePanelHeader>

      <NodePanelBody>
        {/* Outputs */}
        {outputs.map(([key, output]) =>
          output && (
            <div
              className="output flex flex-row justify-end items-center"
              key={key}
              data-testid={`output-${key}`}
            >
              <div
                className="output-title inline-block align-middle"
                data-testid="output-title"
              >
                {output.label}

              </div>
              <div
                className='rounded-md px-1.5 bg-node-label'>
                {output.socket.type}
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

        {/* Inputs */}
        {inputs.map(([key, input]) =>
          input ? (
            <div
              className="input text-left flex flex-row justify-start items-center"
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
                  className="input-title inline-block align-middle "
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
      </NodePanelBody>
      {/* Controls */}
      <div className='w-full h-full p-2'>
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
      </div>


    </NodePanel>
  )
}
