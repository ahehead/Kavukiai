// Minimal Group/Comment plugin (auto-size, no node-model x/y dependency)
import type { AreaExtra } from 'renderer/nodeEditor/types'
import { type BaseSchemes, type NodeId, type Root, Scope } from 'rete'
import { AreaExtensions, AreaPlugin, type BaseArea } from 'rete-area-plugin'
import type { HistoryAction, HistoryPlugin } from 'rete-history-plugin'
import type { ReactPlugin } from 'rete-react-plugin'
import type { Renderer } from 'rete-react-plugin/_types/renderer'
import type { GroupJson } from 'shared/JsonType'
import {
  Group,
  type GroupStyleChangeOptions,
  type GroupStylePatch,
  type GroupStyleSnapshot,
  MIN_GROUP_HEIGHT,
  MIN_GROUP_WIDTH,
} from './Group'
import { GroupOrderController } from './GroupOrderController'
import { GroupView } from './GroupView'

export { Group, MIN_GROUP_HEIGHT, MIN_GROUP_WIDTH } from './Group'

const DEFAULT_GROUP_LABEL = 'Memo'

const DEFAULT_PADDING = 12
// min size constants are defined in Group.ts

type Produces =
  | { type: 'groupcreated'; data: Group }
  | { type: 'groupremoved'; data: Group }
  | {
    type: 'grouptranslated'
    data: { id: string; dx: number; dy: number; sources?: NodeId[] }
  }
  | {
    // グループがクリック（pointerdown）されたことを通知
    type: 'grouppointerdown'
    data: { groupId: string; event: PointerEvent }
  }

// Group model moved to ./Group

export class GroupPlugin<Schemes extends BaseSchemes> extends Scope<
  Produces,
  [BaseArea<Schemes>, Root<Schemes>]
> {
  private area!: AreaPlugin<Schemes, AreaExtra>
  public _groups = new Map<string, Group>()
  private orderController?: GroupOrderController<Schemes>
  private renderer: Renderer
  private readonly history?: HistoryPlugin<Schemes, any>

  constructor(
    render: ReactPlugin<Schemes, AreaExtra>,
    history?: HistoryPlugin<Schemes, any>
  ) {
    super('group')
    this.renderer = render.renderer
    this.history = history
  }

  public get groups() {
    return this._groups
  }

  public set groups(value: Map<string, Group>) {
    this._groups = value
    if (this.orderController) {
      this.orderController.applyOrder(Array.from(this._groups.keys()))
    }
  }

  setParent(scope: Scope<BaseArea<Schemes>, [Root<Schemes>]>): void {
    super.setParent(scope)
    this.area = this.parentScope<AreaPlugin<Schemes, AreaExtra>>(AreaPlugin)
    this.orderController = new GroupOrderController(
      () => this._groups,
      (map: Map<string, Group>) => {
        this._groups = map
      },
      () => this.area
    )
    const translate = async (id: NodeId, x: number, y: number) => {
      const view = this.area.nodeViews.get(id)
      if (view) await this.area.translate(id, { x, y })
    }

    // --- Area signals
    this.addPipe(async ctx => {
      if (!ctx || typeof ctx !== 'object' || !('type' in ctx)) return ctx
      // console.log('GroupPlugin pipe', ctx)
      // ノードが移動した後のイベント
      if (ctx.type === 'nodedragged') {
        const { id } = ctx.data
        for (const g of this.groups.values()) {
          // 入出の度にリンク集合を更新し、対象ノードがリンク内なら bbox に合わせてフィット（拡大・縮小）
          const wasLinked = g.linkedTo(id)
          const inside = this.intersects(g, id)

          let membershipChanged = false
          if (wasLinked !== inside) {
            if (inside) g.addLink(id)
            else g.removeLink(id)
            membershipChanged = true // リンク集合の変化（入出）
          }

          // 入出があった場合、またはリンク済みノードが動いている場合にフィット
          if (membershipChanged || g.linkedTo(id)) this.fitToLinks(g)
        }
      }

      // ノードが移動している途中のイベント
      if (ctx.type === 'nodetranslate') {
        const { id } = ctx.data
        for (const g of this.groups.values()) {
          // 移動中のノードがリンク済みならフィット
          if (g.linkedTo(id)) {
            this.fitToLinks(g)
          }
        }
      }

      // グループが移動している途中のイベント
      if (ctx.type === 'grouptranslated') {
        const { id, dx, dy } = ctx.data
        const g = this.groups.get(id)
        if (!g) return ctx
        for (const linkId of g.links) {
          const v = this.area.nodeViews.get(linkId)
          if (!v) continue
          await translate(linkId, v.position.x + dx, v.position.y + dy)
        }
      }

      // editorのclearイベント
      if (ctx.type === 'clear') {
        this.clear()
        return ctx
      }

      // ノードが削除された場合、grroup内のリンクを削除し、必要ならフィット
      if (ctx.type === 'noderemoved') {
        const { id } = ctx.data
        for (const g of this.groups.values()) {
          if (g.linkedTo(id)) {
            g.removeLink(id)
            this.fitToLinks(g)
          }
        }
      }

      // ノードがリサイズされた場合、リンク済みノードならフィット
      if (ctx.type === 'noderesized') {
        const { id } = ctx.data
        for (const g of this.groups.values()) {
          if (g.linkedTo(id)) {
            this.fitToLinks(g)
          }
        }
      }
      return ctx
    })
  }

  // Public API
  /** 現在のグループを JSON 配列にシリアライズ */
  public toJson(): GroupJson[] {
    return Array.from(this.groups.values()).map(g => g.toJson())
  }

  /** JSON 配列からグループを復元（既存は置き換え）。ノードは事前に復元済み想定 */
  public fromJson(list: GroupJson[]): void {
    // 破棄はclearイベントで行い、fromJsonは常に追加方向にすると、pasteと整合性が取れる
    // this.clear()
    // 復元
    for (const j of list) {
      const g = Group.fromJson(j)
      this.mountElement(g)
      this.groups.set(g.id, g)
      g.notify()
      this.setElementPosition(g)
      // ここではイベントは発火しない（ロード時の副作用を避ける）
    }
    if (this.orderController) {
      this.orderController.applyOrder(Array.from(this._groups.keys()))
    }
  }

  addGroup(links: NodeId[] = [], text: string = DEFAULT_GROUP_LABEL) {
    if (links.length === 0) return null
    const g = new Group(text)
    g.addLinks(links)
    this.mountElement(g)
    this.groups.set(g.id, g)
    this.fitToLinks(g)
    void this.emit({ type: 'groupcreated', data: g })
    return g
  }

  delete(id: string) {
    const g = this.groups.get(id)
    if (!g) return
    // イベントリスナーを明示的に解除
    if (g.element) {
      // React を先にアンマウント
      this.renderer.unmount(g.element)
      g.element.remove()
    }
    this.groups.delete(id)
    void this.emit({ type: 'groupremoved', data: g })
  }

  async translateGroup(id: string, dx: number, dy: number) {
    const g = this.groups.get(id)
    if (!g) return
    g.updateRect({
      left: g.rect.left + dx,
      top: g.rect.top + dy,
      width: g.rect.width,
      height: g.rect.height,
    })
    this.setElementPosition(g)
    await this.emit({ type: 'grouptranslated', data: { id, dx, dy } })
  }

  /**
   * グループに links を反映して、直後に自動フィットさせるユーティリティ関数（公開）
   * - Group インスタンスまたは group id のどちらでも指定可能
   * - 無効な nodeId は安全に無視される
   */
  public linkToAndFit(target: Group | string, links: NodeId[]) {
    const g = typeof target === 'string' ? this.groups.get(target) : target
    if (!g) return
    // 現在存在しているノードのみをリンク対象にし、既存リンクに追加（重複は除去）
    const validNew = links.filter(id => this.area.nodeViews.has(id))
    g.addLinks(validNew)
    this.fitToLinks(g)
  }

  public bringGroupToFront(target: Group | string) {
    this.orderController?.bringGroupToFront(target)
  }

  public bringGroupForward(target: Group | string) {
    this.orderController?.bringGroupForward(target)
  }

  public sendGroupBackward(target: Group | string) {
    this.orderController?.sendGroupBackward(target)
  }

  public sendGroupToBack(target: Group | string) {
    this.orderController?.sendGroupToBack(target)
  }

  public applyGroupOrder(order: string[]) {
    this.orderController?.applyOrder(order)
  }

  // ---- geometry helpers (view-based; never use model x/y)
  private nodeRect(id: NodeId) {
    const view = this.area.nodeViews.get(id)
    if (!view) return null
    const bb = AreaExtensions.getBoundingBox(this.area, [id])
    return { x: bb.left, y: bb.top, w: bb.width, h: bb.height }
  }

  // links の bbox に完全フィット（拡大・縮小）し、links が空なら最小サイズへ
  private fitToLinks(g: Group) {
    const ids = g.links.filter(id => this.area.nodeViews.has(id))
    if (ids.length) {
      const bb = AreaExtensions.getBoundingBox(this.area, ids)
      const pad = DEFAULT_PADDING
      const padTop = pad + g.topPadding
      g.updateRect({
        left: bb.left - pad,
        top: bb.top - padTop,
        width: bb.width + pad * 2,
        height: bb.height + padTop + pad,
      })
    } else {
      // links が空: 位置は維持、サイズは最小値
      g.updateRect({
        left: g.rect.left,
        top: g.rect.top,
        width: MIN_GROUP_WIDTH,
        height: Math.max(MIN_GROUP_HEIGHT, g.topPadding + DEFAULT_PADDING),
      })
    }
    this.setElementPosition(g)
  }

  private intersects(g: Group, nodeId: NodeId) {
    const r = this.nodeRect(nodeId)
    if (
      !r ||
      g.rect.left == null ||
      g.rect.top == null ||
      g.rect.width == null ||
      g.rect.height == null
    )
      return false
    const gl = g.rect.left,
      gt = g.rect.top,
      gw = g.rect.width,
      gh = g.rect.height
    return !(r.x > gl + gw || r.x + r.w < gl || r.y > gt + gh || r.y + r.h < gt)
  }

  private mountElement(g: Group) {
    const el = document.createElement('div')
    // data-attribute で group を明示
    el.setAttribute('data-rete-group', 'true')
    el.style.position = 'absolute'

    this.area.area.content.add(el) // Area の content レイヤに載せる
    this.orderController?.ensureGroupStacking(el)
    g.element = el
    const getK = () => this.area.area.transform.k ?? 1
    const translate = async (id: string, dx: number, dy: number) =>
      await this.translateGroup(id, dx, dy)
    const emitContextMenu = (e: MouseEvent, group: Group) => {
      void this.area.emit({
        type: 'contextmenu',
        data: {
          event: e,
          context: { type: 'group', group },
        } as any,
      })
    }
    const emitGroupPointerDown = (event: PointerEvent, group: Group) => {
      void this.area.emit({
        type: 'grouppointerdown',
        data: { groupId: group.id, event },
      } as any)
    }
    const handleTextChange = (group: Group) => {
      this.fitToLinks(group)
    }
    const handleStyleChange = (
      group: Group,
      patch: GroupStylePatch | undefined,
      options?: GroupStyleChangeOptions
    ) => {
      this.updateGroupStyle(group, patch, options)
    }
    this.renderer.mount(
      <GroupView
        group={g}
        getK={getK}
        translate={translate}
        emitContextMenu={emitContextMenu}
        emitGroupPointerDown={emitGroupPointerDown}
        onTextChange={handleTextChange}
        onStyleChange={handleStyleChange}
      />,
      el
    )
  }

  private setElementPosition(g: Group) {
    const el = g.element
    if (!el) return
    el.style.transform = `translate(${g.rect.left}px, ${g.rect.top}px)`
  }

  public clear() {
    // すべてのグループ要素からイベントを外して DOM を除去
    for (const id of Array.from(this.groups.keys())) {
      this.delete(id)
    }
    this.groups.clear()
  }

  public updateGroupStyle(
    target: Group | string,
    patch: GroupStylePatch | undefined,
    options?: GroupStyleChangeOptions
  ) {
    const group = typeof target === 'string' ? this.groups.get(target) : target
    if (!group) return
    const prev = options?.prevSnapshot ?? group.getStyleSnapshot()
    const hasPatch =
      patch &&
      (Object.hasOwn(patch, 'bgColor') || Object.hasOwn(patch, 'fontColor'))
    if (hasPatch) {
      group.applyStyle(patch)
    }
    if (!options?.recordHistory) return
    if (!this.history) return
    const next = group.getStyleSnapshot()
    if (styleSnapshotsEqual(prev, next)) return
    this.history.add(this.createStyleHistoryAction(group.id, prev, next))
  }

  private createStyleHistoryAction(
    groupId: string,
    prev: GroupStyleSnapshot,
    next: GroupStyleSnapshot
  ): HistoryAction {
    return {
      undo: async () => {
        this.replaceGroupStyle(groupId, prev)
      },
      redo: async () => {
        this.replaceGroupStyle(groupId, next)
      },
    }
  }

  private replaceGroupStyle(id: string, snapshot: GroupStyleSnapshot) {
    const group = this.groups.get(id)
    if (!group) return
    group.applyStyle({
      bgColor: snapshot.bgColor ?? null,
      fontColor: snapshot.fontColor ?? null,
    })
  }
}

function styleSnapshotsEqual(
  a: GroupStyleSnapshot,
  b: GroupStyleSnapshot
): boolean {
  const bgEqual = (a.bgColor ?? undefined) === (b.bgColor ?? undefined)
  const fontEqual = (a.fontColor ?? undefined) === (b.fontColor ?? undefined)
  return bgEqual && fontEqual
}
