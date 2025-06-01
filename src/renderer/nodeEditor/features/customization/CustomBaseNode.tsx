import { Presets, type RenderEmit } from 'rete-react-plugin'
import type { AreaExtra, NodeInterface, Schemes } from '../../types/Schemes'
import { NodeContainer, NodeHeader, NodeTitle, NodeControlsWrapper, } from 'renderer/nodeEditor/component/nodeParts/NodePanel'
import { NodeOutputPort, NodeSocketName, NodeSocketTypeLabel } from "renderer/nodeEditor/component/nodeParts/NodeSocketParts"
import { NodeInputPort } from "renderer/nodeEditor/component/nodeParts/NodeSocketParts"
import { NodeSocketsWrapper } from "renderer/nodeEditor/component/nodeParts/NodeSocketParts"
import type { AreaPlugin } from 'rete-area-plugin'
import { useRef } from 'react'
import { useNodeResize } from '../../hooks/useNodeResize'
import type { HistoryPlugin } from 'rete-history-plugin'
import { ControlLabel } from 'renderer/nodeEditor/component/nodeParts/NodeControlParts'
import Markdown from 'react-markdown';
import { Tooltip, TooltipTrigger, TooltipContent } from 'renderer/components/ui/tooltip';
import remarkGfm from 'remark-gfm'

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

    // Tooltip表示を共通化するヘルパー
    const withTooltip = (
      show: boolean,
      trigger: React.ReactNode,
      tooltipText?: string
    ) =>
      show && tooltipText ? (
        <Tooltip>
          <TooltipTrigger asChild>{trigger}</TooltipTrigger>
          <TooltipContent className="prose prose-sm">
            <Markdown remarkPlugins={[remarkGfm]}>{tooltipText}</Markdown>
          </TooltipContent>
        </Tooltip>
      ) : (
        trigger
      );

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
              <NodeOutputPort
                key={key}
                data-testid={`output-${key}`}
              >
                <NodeSocketName isExec={output.socket.isExec} data-testid="output-title">
                  {output.label}
                </NodeSocketName>
                {!output.socket.isExec &&
                  withTooltip(
                    !!output.socket.tooltipType,
                    <NodeSocketTypeLabel data-testid="output-type">{output.socket.name}</NodeSocketTypeLabel>,
                    output.socket.tooltipType
                  )}
                <Presets.classic.RefSocket
                  name="output-socket"
                  side="output"
                  socketKey={key}
                  nodeId={id}
                  emit={emit}
                  payload={output.socket}
                  data-testid="output-socket"
                />
              </NodeOutputPort>
            )
          )}

          {/* Inputs */}
          {inputs.map(([key, input]) => {
            if (!input) return null;

            return (
              <NodeInputPort
                showControl={Boolean(input.control && input.showControl)}
                cols={input.control?.opts.cols || 0}
                key={key}
                data-testid={`input-${key}`}
              >
                {/* !showControl */}
                {!(input.control && input.showControl) && (
                  <>
                    <Presets.classic.RefSocket
                      name="input-socket"
                      side="input"
                      socketKey={key}
                      nodeId={id}
                      emit={emit}
                      payload={input.socket}
                      data-testid="input-socket"
                    />
                    {!input.socket.isExec &&
                      withTooltip(
                        !!input.socket.tooltipType,
                        <NodeSocketTypeLabel data-testid="input-type">{input.socket.name}</NodeSocketTypeLabel>,
                        input.socket.tooltipType
                      )}
                    {withTooltip(
                      !!input.tooltip,
                      <NodeSocketName isExec={input.socket.isExec} data-testid="input-title">{input.label}</NodeSocketName>,
                      input.tooltip
                    )}
                  </>
                )
                }
                {input.control && input.showControl && (
                  <>
                    {input.control.opts.label && (
                      <ControlLabel
                        cols={input.control.opts.cols}
                        htmlFor={input.control.id}
                      >
                        {withTooltip(
                          !!input.tooltip,
                          <div className='inline-block'>{input.control.opts.label}</div>,
                          input.tooltip
                        )}
                      </ControlLabel>
                    )
                    }
                    <Presets.classic.RefControl
                      key={key}
                      name="input-control"
                      emit={emit}
                      payload={input.control}
                      data-testid="input-control"
                    />
                  </>
                )}
              </NodeInputPort>
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
