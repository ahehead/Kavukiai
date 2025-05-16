import { Presets, type RenderEmit } from 'rete-react-plugin'
import type { AreaExtra, NodeInterface, Schemes } from '../types'
import { NodePanel, NodePanelSockets, NodePanelHeader, NodeSocketName, NodeSocketTypeLabel, NodeSocketWrapper, NodeTitle, NodePanelControls } from 'renderer/components/NodePanel'
import type { AreaPlugin } from 'rete-area-plugin'
import { useRef } from 'react'
import type { HistoryAction, HistoryPlugin } from 'rete-history-plugin'

type Props<S extends Schemes> = {
  data: NodeInterface
  emit: RenderEmit<S>
}

class SizeChangeHistory implements HistoryAction {
  constructor(
    private node: NodeInterface,
    private area: AreaPlugin<Schemes, AreaExtra>,
    private prev: { width: number; height: number },
    private next: { width: number; height: number }
  ) { }
  async undo() {
    this.node.setSize(this.prev.width, this.prev.height)
    await this.area.resize(this.node.id, this.prev.width, this.prev.height)
  }
  async redo() {
    this.node.setSize(this.next.width, this.next.height)
    await this.area.resize(this.node.id, this.next.width, this.next.height)
  }
}



export function createCustomNode(
  area: AreaPlugin<Schemes, AreaExtra>,
  history: HistoryPlugin<Schemes>, getZoom: () => number
) {
  return function CustomNode<Scheme extends Schemes>({ data, emit }: Props<Scheme>) {
    const nodeMinWidth = 180
    const nodeMinHeight = data.getMinHeight()
    const inputs = Object.entries(data.inputs)
    const outputs = Object.entries(data.outputs)
    const controls = Object.entries(data.controls)
    const { id, label, width, height, selected = false } = data

    const panelRef = useRef<HTMLDivElement>(null)

    function sortByIndex<T extends [string, undefined | { index?: number }][]>(entries: T) {
      entries.sort((a, b) => (a[1]?.index || 0) - (b[1]?.index || 0))
    }
    sortByIndex(inputs)
    sortByIndex(outputs)
    sortByIndex(controls)

    function getPanelSize(): { width: number; height: number } {
      if (panelRef.current) {
        const rect = panelRef.current.getBoundingClientRect()
        const zoom = getZoom()
        return { width: rect.width / zoom, height: rect.height / zoom }
      }
      return { width: nodeMinWidth, height: nodeMinHeight }
    }

    function startResize(e: React.PointerEvent) {
      e.stopPropagation();
      const { width: startW, height: startH } = getPanelSize();
      const startX = e.clientX;
      const startY = e.clientY;
      const zoom = getZoom();

      async function move(e: PointerEvent) {
        const dx = (e.clientX - startX) / zoom;
        const dy = (e.clientY - startY) / zoom;
        const newWidth = Math.max(startW + dx, nodeMinWidth);
        const newHeight = Math.max(startH + dy, nodeMinHeight);
        data.setSize(newWidth, newHeight);
        await area.resize(data.id, newWidth, newHeight);
      }

      function up() {
        window.removeEventListener('pointermove', move);
        window.removeEventListener('pointerup', up);
        // リサイズ終了時に一度だけヒストリーへ追加
        const { width, height } = data.getSize();
        console.log('size', width, height);
        if (width === undefined || height === undefined) return;
        history.add(
          new SizeChangeHistory(
            data,
            area,
            { width: startW, height: startH },
            { width: width, height: height }
          )
        );
      }

      window.addEventListener('pointermove', move);
      window.addEventListener('pointerup', up);
    }


    return (
      <NodePanel
        ref={panelRef}
        selected={selected}
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

        <div
          className="absolute right-0 bottom-0 w-4 h-4 cursor-se-resize bg-transparent"
          onPointerDown={startResize}
        />
      </NodePanel>
    )
  }
}
