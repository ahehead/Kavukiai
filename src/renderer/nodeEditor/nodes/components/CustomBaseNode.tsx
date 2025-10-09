import { X } from 'lucide-react'
import { useRef } from 'react'
import { ControlLabel } from 'renderer/nodeEditor/nodes/components/common/NodeControlParts'
import {
  NodeBody,
  NodeContainer,
  NodeControlsWrapper,
  NodeHeader,
  NodeTitle,
} from 'renderer/nodeEditor/nodes/components/common/NodeParts'
import {
  NodeInputPort,
  NodeInputPortContent,
  NodeOutputPort,
  NodeSocketLabel,
  NodeSocketsWrapper,
  NodeSocketTypeLabel,
} from 'renderer/nodeEditor/nodes/components/common/NodeSocketParts'
import {
  type NodeControl,
  NodeMinWidth,
  type TypedSocket,
  useSelectedValue,
  useStatusValue,
} from 'renderer/nodeEditor/types'
import { useSocketConnection } from 'renderer/nodeEditor/types/Socket/useTypedSocket'
import { NodeEditor } from 'rete'
import type { AreaPlugin } from 'rete-area-plugin'
import type { HistoryPlugin } from 'rete-history-plugin'
import { Presets, type RenderEmit } from 'rete-react-plugin'
import type { AreaExtra, NodeInterface, Schemes } from '../../types/ReteSchemes'
import { getContextMenuPath } from '../util/getContextMenuPath'
import { removeNodeWithConnections } from '../util/removeNode'
import { withTooltip } from './common/TooltipSetting'
import { useNodeResize } from './hooks/useNodeResize'

type Props<S extends Schemes> = {
  data: NodeInterface
  emit: RenderEmit<S>
}

export function createCustomNode(
  area: AreaPlugin<Schemes, AreaExtra>,
  history: HistoryPlugin<Schemes>
) {
  return function CustomNode<Scheme extends Schemes>({
    data,
    emit,
  }: Props<Scheme>) {
    const elementRef = useRef<HTMLDivElement>(null)
    const { startResize, clearNodeSize } = useNodeResize({
      node: data,
      area,
      history,
      elementRef,
    })
    const inputs = Object.entries(data.inputs)
    const outputs = Object.entries(data.outputs)
    const controls = Object.entries(data.controls)
    const { id, label, width, height, typeId } = data
    // typeId (namespace:name) を利用してメニュー階層を取得
    const hierarchyPath = getContextMenuPath(typeId)
    const selected = useSelectedValue(data)
    const status = useStatusValue(data)
    function sortByIndex<T extends [string, undefined | { index?: number }][]>(
      entries: T
    ) {
      entries.sort((a, b) => (a[1]?.index || 0) - (b[1]?.index || 0))
    }
    sortByIndex(inputs)
    sortByIndex(outputs)
    sortByIndex(controls)

    const handleDoubleClickResize = async (e: React.MouseEvent) => {
      e.stopPropagation()
      await clearNodeSize()
    }

    const handleDeleteNode = async (e: React.MouseEvent) => {
      e.stopPropagation()
      try {
        const editor = area.parentScope<NodeEditor<Schemes>>(NodeEditor)
        await removeNodeWithConnections(editor, id)
      } catch {
        // noop: editor が未初期化の場合など
      }
    }

    const InputControlWithSocketState = ({
      control,
      socket,
    }: {
      control: NodeControl
      socket: TypedSocket
    }) => {
      const isConnected = useSocketConnection(socket)
      return (
        <Presets.classic.RefControl
          name="input-control group"
          emit={emit}
          payload={control}
          data-testid="input-control"
          data-is-connected={isConnected}
        />
      )
    }

    return (
      <NodeContainer
        ref={elementRef}
        selected={selected}
        status={status}
        nodeType={label}
        style={{
          width: `${Number.isFinite(width) ? width : NodeMinWidth}px`,
          height: Number.isFinite(height) ? `${height}px` : 'auto',
        }}
      >
        <NodeHeader status={status} nodeType={label}>
          <NodeTitle status={status}>{label}</NodeTitle>
          <button
            aria-label="ノードを削除"
            title="ノードを削除"
            className="mr-1.5 inline-flex h-6 w-6 items-center justify-center rounded text-node-header-fg/25 hover:text-node-header-fg/90 hover:bg-node-header-fg/10 transition"
            onPointerDown={e => e.stopPropagation()}
            onClick={handleDeleteNode}
            data-testid="delete-node-button"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </NodeHeader>
        {/* Hierarchy ribbon above title, extends from header and left-aligned */}
        {hierarchyPath && (
          <div
            className="absolute left-0 -top-5 bg-node-header text-xs px-2 pt-1 pb-2 truncate text-node-header-fg/90"
            title={hierarchyPath}
          >
            {hierarchyPath}
          </div>
        )}

        <NodeBody>
          <NodeSocketsWrapper>
            {/* Outputs */}
            {outputs.map(
              ([key, output]) =>
                output && (
                  <NodeOutputPort key={key} data-testid={`output-${key}`}>
                    {output.label && (
                      <NodeSocketLabel
                        isExec={output.socket.isExec}
                        data-testid="output-title"
                      >
                        {output.label}
                      </NodeSocketLabel>
                    )}

                    {!output.socket.isExec &&
                      withTooltip(
                        <NodeSocketTypeLabel data-testid="output-type">
                          {output.socket.name}
                        </NodeSocketTypeLabel>,
                        true,
                        output.socket.tooltip
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
              if (!input) return null
              return (
                // NodeのInputは二種類、ソケットとコントロールモードがある。
                // 更にコントロールモードは、ラベルとコントロールを一行にするか二行にするかある。
                // 更にexecソケット場合は、繋いだままコントロールを表示できる
                <NodeInputPort key={key} data-testid={`input-${key}`}>
                  <div className="flex items-center">
                    <Presets.classic.RefSocket
                      name="input-socket group"
                      side="input"
                      socketKey={key}
                      nodeId={id}
                      emit={emit}
                      payload={input.socket}
                      data-testid="input-socket"
                      data-show-control={input.control && input.showControl}
                    />
                  </div>
                  <NodeInputPortContent
                    showControl={Boolean(input.control && input.showControl)}
                    cols={input.control?.opts.cols || 0}
                  >
                    {/* !showControl */}
                    {!(input.control && input.showControl) && (
                      <>
                        {!input.socket.isExec &&
                          withTooltip(
                            <NodeSocketTypeLabel data-testid="input-type">
                              {input.socket.name}
                            </NodeSocketTypeLabel>,
                            true,
                            input.socket.tooltip
                          )}
                        {input.label &&
                          withTooltip(
                            <NodeSocketLabel
                              isExec={input.socket.isExec}
                              data-testid="input-title"
                              isRequired={input.require}
                            >
                              {input.label}
                            </NodeSocketLabel>,
                            false,
                            input.tooltip
                          )}
                      </>
                    )}
                    {input.control && input.showControl && (
                      <>
                        {input.control.opts.label &&
                          input.control.opts.cols !== 0 && (
                            <ControlLabel
                              cols={input.control.opts.cols}
                              htmlFor={input.control.id}
                              isRequired={input.require}
                            >
                              {withTooltip(
                                <div className="inline-flex items-center">
                                  {input.control.opts.label}
                                </div>,
                                false,
                                input.tooltip
                              )}
                            </ControlLabel>
                          )}
                        <InputControlWithSocketState
                          key={key}
                          control={input.control}
                          socket={input.socket}
                        />
                      </>
                    )}
                  </NodeInputPortContent>
                </NodeInputPort>
              )
            })}
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
        </NodeBody>
        <button
          className="absolute right-0 bottom-0 w-4 h-4 cursor-se-resize bg-transparent"
          onPointerDown={startResize}
          onDoubleClick={handleDoubleClickResize}
        />
      </NodeContainer>
    )
  }
}
