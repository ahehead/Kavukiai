import type { NodeEditor } from 'rete'
import type { AreaPlugin } from 'rete-area-plugin'
import type { Item } from 'rete-context-menu-plugin/_types/types'
import type { ControlFlowEngine } from 'rete-engine'
import type { HistoryActions, HistoryPlugin } from 'rete-history-plugin'
import {
  contextMenuStructure,
  type NodeDeps,
} from '../../../nodes/nodeFactories'
import type {
  AreaExtra,
  NodeInterface,
  NodeTypes,
  Schemes,
} from '../../../types/Schemes'
import type { GroupPlugin } from '../../group'
import type { DataflowEngine } from '../../safe-dataflow/dataflowEngin'
import { ContextMenuPlugin } from '..'
import { collectTargetNodes, createCopyItem } from './items/copy'
import { createNodeFactoryMenuItems } from './items/createContextMenu'
import { createDeleteConnectionItem } from './items/createDeleteConnectionItem'
import { createDeleteNodeItem } from './items/createDeleteNodeItem'
import {
  createToggleInputControlMenuItem,
  filterInputControls,
} from './items/createToggleInputControlMenuItem'
import { createPasteItem } from './items/paste'

type ContextMenuDependencies = {
  editor: NodeEditor<Schemes>
  area: AreaPlugin<Schemes, AreaExtra>
  dataflow: DataflowEngine<Schemes>
  controlflow: ControlFlowEngine<Schemes>
  history: HistoryPlugin<Schemes, HistoryActions<Schemes>>
  groupPlugin: GroupPlugin<Schemes>
}

function isConnection(
  ctx: any
): ctx is { id: string; source: string; target: string } {
  return ctx && typeof ctx === 'object' && 'source' in ctx && 'target' in ctx
}

function isNode(ctx: any): ctx is NodeInterface {
  return ctx && typeof ctx === 'object' && 'id' in ctx && 'inputs' in ctx
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
      if (context === 'root') {
        return {
          searchBar: true,
          list: [
            ...createNodeFactoryMenuItems(
              contextMenuStructure,
              editor,
              nodeDeps,
              pointer
            ),
            createPasteItem(pointer, nodeDeps),
          ],
        }
      }

      const listItems: Item[] = []

      if (isNode(context)) {
        // node のinputにcontrolがある場合、(showControlをtoggleする)メニュー項目を追加
        addToggleInputMenuItem(context, listItems, editor, area, dataflow)

        // group機能
        const groupItem = {
          label: 'グループ化',
          key: 'grouping',
          handler: () => {
            const targetNodes = collectTargetNodes(context, editor)
            groupPlugin.addGroup(
              'test',
              targetNodes.map(node => node.id)
            )
          },
        }
        listItems.push(groupItem)

        // コピー機能
        listItems.push(createCopyItem(context, editor, area))
        // node削除機能
        listItems.push(createDeleteNodeItem(context, editor))
      }

      if (isConnection(context)) {
        // 接続削除機能
        listItems.push(createDeleteConnectionItem(context, editor))
      }
      return {
        searchBar: false,
        list: listItems,
      }
    },
  })
}

/**
 * node のinputにcontrolがある場合、(showControlをtoggleする)メニュー項目を追加
 * @param context
 * @param listItems
 * @param editor
 * @param area
 * @param dataflow
 */
function addToggleInputMenuItem(
  context: NodeTypes,
  listItems: Item[],
  editor: NodeEditor<Schemes>,
  area: AreaPlugin<Schemes, AreaExtra>,
  dataflow: DataflowEngine<Schemes>
) {
  const inputlist = filterInputControls(context.inputs)
  if (inputlist.length > 0) {
    listItems.push(
      createToggleInputControlMenuItem(
        context,
        editor,
        area,
        dataflow,
        inputlist
      )
    )
  }
}
