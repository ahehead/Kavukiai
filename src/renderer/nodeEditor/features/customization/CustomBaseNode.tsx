import { Presets, type RenderEmit } from 'rete-react-plugin'
import type { AreaExtra, NodeInterface, Schemes } from '../../types/Schemes'
import { NodeContainer, NodeHeader, NodeTitle, NodeControlsWrapper, } from 'renderer/nodeEditor/component/nodeParts/NodePanel'
import { NodeSocketName, NodeSocketTypeLabel } from "renderer/nodeEditor/component/nodeParts/NodeSocketParts"
import { NodePort } from "renderer/nodeEditor/component/nodeParts/NodeSocketParts"
import { NodeSocketsWrapper } from "renderer/nodeEditor/component/nodeParts/NodeSocketParts"
import type { AreaPlugin } from 'rete-area-plugin'
import { useRef } from 'react'
import { useNodeResize } from '../../hooks/useNodeResize'
import type { HistoryPlugin } from 'rete-history-plugin'

type Props<S extends Schemes> = {
  data: NodeInterface
  emit: RenderEmit<S>
}

export function createCustomNode(
  area: AreaPlugin<Schemes, AreaExtra>,
  history: HistoryPlugin<Schemes>,
  getZoom: () => number
) {
  return function CustomNode<Scheme extends Schemes>({ data, emit }: Props<Scheme>) {
    const panelRef = useRef<HTMLDivElement>(null)
    const { startResize, nodeMinWidth, nodeMinHeight, clearNodeSize } = useNodeResize({
      node: data,
      area,
      history,
      getZoom,
      panelRef
    });
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

    const handleDoubleClickResize = async (e: React.MouseEvent) => {
      e.stopPropagation();
      await clearNodeSize();
    };

    return (
      <NodeContainer
        ref={panelRef}
        selected={selected}
        status={data.status}
        style={{
          width: `${Number.isFinite(width) ? width : nodeMinWidth}px`,
          height: Number.isFinite(height) ? `${height}px` : 'auto'
        }}
      >
        <NodeHeader status={data.status}>
          <NodeTitle status={data.status}>{label}</NodeTitle>
        </NodeHeader>

        <NodeSocketsWrapper>
          {/* Outputs */}
          {outputs.map(([key, output]) =>
            output && (
              <NodePort
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
              </NodePort>
            )
          )}

          {/* Inputs */}
          {inputs.map(([key, input]) => {
            if (!input) return null;
            if (!(input.control && input.showControl)) {
              return (
                <NodePort
                  side="input"
                  isShowAndHaveControl={input.control && input.showControl}
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
                  <NodeSocketTypeLabel data-testid="input-type">
                    {input.socket.name}
                  </NodeSocketTypeLabel>
                  <NodeSocketName data-testid="input-title">
                    {input.label}
                  </NodeSocketName>
                </NodePort>
              )
            }
            return (
              <Presets.classic.RefControl
                key={key}
                name="input-control"
                emit={emit}
                payload={input.control}
                data-testid="input-control"
              />

            )
          }
          )}

        </NodeSocketsWrapper>
        {/* Controls */}
        <NodeControlsWrapper>
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
        </NodeControlsWrapper>

        <div
          className="absolute right-0 bottom-0 w-4 h-4 cursor-se-resize bg-transparent"
          onPointerDown={startResize}
          onDoubleClick={handleDoubleClickResize}
        />
      </NodeContainer>
    )
  }
}
