import { Presets, type RenderEmit } from 'rete-react-plugin'
import type { NodeInterface, Schemes } from '../types'
import { NodePanel, NodePanelSockets, NodePanelHeader, NodeSocketName, NodeSocketTypeLabel, NodeSocketWrapper, NodeTitle, NodePanelControls } from 'renderer/components/NodePanel'

type Props<S extends Schemes> = {
  data: NodeInterface
  emit: RenderEmit<S>
}

const nodeMinWidth = 180

export function CustomNode<Scheme extends Schemes>({ data, emit }: Props<Scheme>) {
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
        width: `${Number.isFinite(width) ? width : nodeMinWidth}px`,
        height: Number.isFinite(height) ? `${height}px` : 'auto'
      }}
    >
      <NodePanelHeader>
        <NodeTitle>{label}</NodeTitle>
      </NodePanelHeader>

      <NodePanelSockets>
        {/* Outputs */}
        {outputs.map(([key, output]) =>
          output && (
            <NodeSocketWrapper
              key={key}
              data-testid={`output-${key}`}
              side="output">
              <NodeSocketName data-testid="output-title">
                {output.label}
              </NodeSocketName>
              <NodeSocketTypeLabel data-testid="output-type">
                {output.socket.name}
              </NodeSocketTypeLabel>
              <Presets.classic.RefSocket
                name="output-socket"
                side="output"
                socketKey={key}
                nodeId={id}
                emit={emit}
                payload={output.socket}
                data-testid="output-socket"
              />
            </NodeSocketWrapper>
          )
        )}

        {/* Inputs */}
        {inputs.map(([key, input]) =>
          input ? (
            <NodeSocketWrapper
              side="input"
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
                <>
                  <NodeSocketTypeLabel data-testid="input-type">
                    {input.socket.name}
                  </NodeSocketTypeLabel>
                  <NodeSocketName data-testid="input-title">
                    {input.label}
                  </NodeSocketName>
                </>
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
            </NodeSocketWrapper>
          ) : null
        )}
      </NodePanelSockets>
      {/* Controls */}
      <NodePanelControls>
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
      </NodePanelControls>


    </NodePanel>
  )
}
