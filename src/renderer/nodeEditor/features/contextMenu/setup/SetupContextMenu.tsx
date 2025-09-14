import type { NodeEditor } from 'rete'
import type { AreaPlugin } from 'rete-area-plugin'
import type { ControlFlowEngine } from 'rete-engine'
import type { HistoryActions, HistoryPlugin } from 'rete-history-plugin'
import type { NodeDeps } from '../../../nodes/factoryTypes'
import type { AreaExtra, NodeInterface, Schemes } from '../../../types/ReteSchemes'
import type { Group, GroupPlugin } from '../../group'
import type { DataflowEngine } from '../../safe-dataflow/dataflowEngin'
import { ContextMenuPlugin } from '..'
import { contextMenuStructure } from '../menuTree'
import { createCopyItem } from './items/copy'
import { createNodeFactoryMenuItems } from './items/createContextMenu'
import { createDeleteConnectionItem } from './items/createDeleteConnectionItem'
import { createDeleteNodeItem } from './items/createDeleteNodeItem'
import {
  createToggleInputControlMenuItem,
  filterInputControls,
} from './items/createToggleInputControlMenuItem'
import { createDeleteGroupMenuItem, createGroupMenuItem } from './items/group'
import { createPasteItem } from './items/paste'

type ContextMenuDependencies = {
  editor: NodeEditor<Schemes>
  area: AreaPlugin<Schemes, AreaExtra>
  dataflow: DataflowEngine<Schemes>
  controlflow: ControlFlowEngine<Schemes>
  history: HistoryPlugin<Schemes, HistoryActions<Schemes>>
  groupPlugin: GroupPlugin<Schemes>
}

function isRoot(ctx: any): ctx is 'root' {
  return ctx === 'root'
}

function isConnection(
  ctx: any
): ctx is { id: string; source: string; target: string } {
  return ctx && typeof ctx === 'object' && 'source' in ctx && 'target' in ctx
}

function isNode(ctx: any): ctx is NodeInterface {
  return ctx && typeof ctx === 'object' && 'id' in ctx && 'inputs' in ctx
}

function isGroup(ctx: any): ctx is { type: 'group'; group: Group } {
  return ctx && typeof ctx === 'object' && 'type' in ctx && ctx.type === 'group'
}

export function setupContextMenu({
  editor,
  area,
  dataflow,
  controlflow,
  history,
  groupPlugin,
}: ContextMenuDependencies) {
  const nodeDeps: NodeDeps = { editor, area, dataflow, controlflow, history }

  return new ContextMenuPlugin<Schemes>({
    items: context => {
      // 右クリックを押されたときの座標。
      const pointer = area.area.pointer

      // 何もない場所で右クリックされた場合
      if (isRoot(context)) {
        return {
          searchBar: true,
          list: [
            ...createNodeFactoryMenuItems(
              contextMenuStructure,
              editor,
              nodeDeps,
              pointer
            ),
            createPasteItem(pointer, nodeDeps, groupPlugin),
          ],
        }
      }
      // グループを右クリック
      if (isGroup(context)) {
        return {
          searchBar: false,
          list: [
            ...createNodeFactoryMenuItems(
              contextMenuStructure,
              editor,
              nodeDeps,
              pointer,
              {
                // グループコンテキストから生成したノードは自動的にグループにリンク
                afterCreate: ({ node }) => {
                  groupPlugin.linkToAndFit(context.group, [node.id])
                },
              }
            ),
            createDeleteGroupMenuItem(context.group, groupPlugin),
          ],
        }
      }

      // ノードを右クリック
      if (isNode(context)) {
        // node のinputにcontrolがある場合、(showControlをtoggleする)メニュー項目を追加
        const inputlist = filterInputControls(context.inputs)

        return {
          searchBar: false,
          list: [
            // 条件に一致する場合のみメニュー項目を追加（nullを含めない）
            ...(inputlist.length > 0
              ? [
                createToggleInputControlMenuItem(
                  context,
                  editor,
                  area,
                  dataflow,
                  inputlist
                ),
              ]
              : []),
            // group機能
            createGroupMenuItem(context, editor, groupPlugin),
            // コピー機能
            createCopyItem(context, editor, area),
            // node削除機能
            createDeleteNodeItem(context, editor),
          ],
        }
      }

      // 接続を右クリック
      if (isConnection(context)) {
        return {
          searchBar: false,
          list: [createDeleteConnectionItem(context, editor)],
        }
      }

      // デフォルト（想定外の文脈）
      return { searchBar: false, list: [] }
    },
  })
}
