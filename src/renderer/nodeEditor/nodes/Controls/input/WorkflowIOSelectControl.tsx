import { type JSX, useEffect, useMemo, useRef, useState } from 'react'
import { BaseControl, type ControlOptions, useControlValue } from 'renderer/nodeEditor/types'
import { Drag } from 'rete-react-plugin'
import { useStopWheel } from '../../util/useStopWheel'

export type WorkflowMapNode = {
  inputs?: Record<string, unknown>
  class_type?: string
  _meta?: { title?: string }
}
export type WorkflowMap = Record<string, WorkflowMapNode>

export type PrimitiveType = 'string' | 'number' | 'boolean'

export interface WorkflowIOSelection {
  key: string
  path: string
  type?: PrimitiveType
  default?: unknown
  meta?: { nodeTitle?: string; propKey?: string }
}

export interface WorkflowIOSelectValue {
  workflow: unknown
  selections: WorkflowIOSelection[]
}

export type WorkflowIOSelectMode = 'inputs' | 'outputs'

export interface WorkflowIOSelectParams
  extends ControlOptions<WorkflowIOSelectValue> {
  mode: WorkflowIOSelectMode
  value?: WorkflowIOSelectValue
  filters?: {
    leafNodesOnly?: boolean
    primitiveInputsOnly?: boolean
  }
}

interface InputCandidate {
  path: string
  nodeId: string
  propKey: string
  inferredType: PrimitiveType
  defaultValue: unknown
  nodeTitle: string
}
interface OutputCandidate {
  nodeId: string
  nodeTitle: string
  path: string
}

function isPrimitive(v: unknown): v is string | number | boolean {
  return (
    typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean'
  )
}
function inferType(v: unknown): PrimitiveType {
  if (typeof v === 'boolean') return 'boolean'
  if (typeof v === 'number') return 'number'
  return 'string'
}
function toWorkflowMap(workflow: unknown): WorkflowMap | null {
  if (!workflow || typeof workflow !== 'object') return null
  return workflow as WorkflowMap
}
function collectReferencedNodeIds(map: WorkflowMap): Set<string> {
  const refs = new Set<string>()
  for (const node of Object.values(map)) {
    if (!node || typeof node !== 'object') continue
    const inputs = node.inputs ?? {}
    for (const val of Object.values(inputs)) {
      if (Array.isArray(val) && typeof val[0] === 'string') refs.add(val[0])
    }
  }
  return refs
}
function extractInputCandidates(workflow: unknown, primitiveOnly: boolean) {
  const map = toWorkflowMap(workflow)
  if (!map) return [] as InputCandidate[]
  const list: InputCandidate[] = []
  for (const [nodeId, node] of Object.entries(map)) {
    const inputs = node.inputs ?? {}
    for (const [propKey, val] of Object.entries(inputs)) {
      if (primitiveOnly && !isPrimitive(val)) continue
      if (!isPrimitive(val)) continue
      list.push({
        path: `${nodeId}.inputs.${propKey}`,
        nodeId,
        propKey,
        inferredType: inferType(val),
        defaultValue: val,
        nodeTitle: node._meta?.title || node.class_type || nodeId,
      })
    }
  }
  return list
}
function extractOutputCandidates(workflow: unknown, leafOnly: boolean) {
  const map = toWorkflowMap(workflow)
  if (!map) return [] as OutputCandidate[]
  const refs = leafOnly ? collectReferencedNodeIds(map) : new Set<string>()
  const list: OutputCandidate[] = []
  for (const [nodeId, node] of Object.entries(map)) {
    if (leafOnly && refs.has(nodeId)) continue
    list.push({ nodeId, nodeTitle: node._meta?.title || node.class_type || nodeId, path: nodeId })
  }
  return list
}

export class WorkflowIOSelectControl extends BaseControl<
  WorkflowIOSelectValue,
  WorkflowIOSelectParams
> {
  private value: WorkflowIOSelectValue
  constructor(params: WorkflowIOSelectParams) {
    super(params)
    this.value = params.value ?? { workflow: {}, selections: [] }
  }
  getValue(): WorkflowIOSelectValue {
    return this.value
  }
  setValue(v: WorkflowIOSelectValue) {
    const prev = this.value
    this.value = v
    if (prev !== v) this.addHistory(prev, v)
    this.opts.onChange?.(this.value)
    this.notify()
  }
  private get optParams(): WorkflowIOSelectParams {
    return this.opts as WorkflowIOSelectParams
  }
  private getCandidates(workflow: unknown) {
    if (this.optParams.mode === 'inputs') {
      return extractInputCandidates(workflow, !!this.optParams.filters?.primitiveInputsOnly)
    }
    return extractOutputCandidates(workflow, !!this.optParams.filters?.leafNodesOnly)
  }
  setWorkflow(workflow: unknown) {
    const valid = new Set(this.getCandidates(workflow).map(c => (c as any).path))
    const nextSel = this.value.selections.filter(s => valid.has(s.path))
    this.setValue({ workflow, selections: nextSel })
  }
  addSelection(candidate: InputCandidate | OutputCandidate) {
    const isInput = this.optParams.mode === 'inputs'
    const existing = new Set(this.value.selections.map(s => s.key))
    let base = isInput ? (candidate as InputCandidate).propKey : candidate.nodeId
    if (!base) base = 'key'
    let keyName = base
    let i = 2
    while (existing.has(keyName)) keyName = `${base}${i++}`
    const sel: WorkflowIOSelection = {
      key: keyName,
      path: (candidate as any).path,
      type: isInput ? (candidate as InputCandidate).inferredType : undefined,
      default: isInput ? (candidate as InputCandidate).defaultValue : undefined,
      meta: {
        nodeTitle: (candidate as any).nodeTitle,
        propKey: 'propKey' in candidate ? (candidate as any).propKey : undefined,
      },
    }
    this.setValue({ workflow: this.value.workflow, selections: [...this.value.selections, sel] })
  }
  removeSelection(path: string) {
    this.setValue({ workflow: this.value.workflow, selections: this.value.selections.filter(s => s.path !== path) })
  }
  updateKey(path: string, nextKey: string) {
    if (!nextKey) return
    if (this.value.selections.some(s => s.key === nextKey)) return
    this.setValue({
      workflow: this.value.workflow,
      selections: this.value.selections.map(s => (s.path === path ? { ...s, key: nextKey } : s)),
    })
  }
  updateType(path: string, next: PrimitiveType) {
    if (this.optParams.mode !== 'inputs') return
    this.setValue({
      workflow: this.value.workflow,
      selections: this.value.selections.map(s => (s.path === path ? { ...s, type: next } : s)),
    })
  }
  getSelections() {
    return this.value.selections
  }
}

export function WorkflowIOSelectControlView({ data: control }: { data: WorkflowIOSelectControl }): JSX.Element {
  const value = useControlValue(control)
  const mode = (control as any).opts.mode as WorkflowIOSelectMode
  const filters = (control as any).opts.filters as WorkflowIOSelectParams['filters'] | undefined
  const candidates = useMemo(() => {
    return mode === 'inputs'
      ? extractInputCandidates(value.workflow, !!filters?.primitiveInputsOnly)
      : extractOutputCandidates(value.workflow, !!filters?.leafNodesOnly)
  }, [value.workflow, mode, filters])
  const selectedByPath = useMemo(() => {
    const m = new Map<string, WorkflowIOSelection>()
    for (const s of value.selections) m.set(s.path, s)
    return m
  }, [value.selections])
  const listRef = useRef<HTMLDivElement | null>(null)
  useStopWheel(listRef)
  const [drafts, setDrafts] = useState<Record<string, string>>({})
  useEffect(() => setDrafts({}), [value.workflow])
  const onToggle = (cand: InputCandidate | OutputCandidate, checked: boolean) => {
    if (checked) control.addSelection(cand)
    else control.removeSelection((cand as any).path)
  }
  const onCommitKey = (path: string) => {
    const d = drafts[path]
    if (d) control.updateKey(path, d)
  }
  return (
    <Drag.NoDrag>
      <div className="flex flex-col gap-1 h-full w-full">
        <div ref={listRef} className="flex-1 w-full min-h-0 overflow-y-auto border rounded p-2 bg-node-bg">
          {candidates.length === 0 && (
            <div className="text-xs text-muted-foreground">No candidates.</div>
          )}
          {candidates.map((cand: InputCandidate | OutputCandidate) => {
            const path = cand.path
            const selected = selectedByPath.get(path)
            const keyDraft = drafts[path] ?? selected?.key ?? (mode === 'inputs' ? (cand as InputCandidate).propKey : cand.nodeId)
            return (
              <div key={path} className="mb-1.5 border-b pb-1.5">
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={!!selected} onChange={e => onToggle(cand, e.target.checked)} />
                  <div className="flex-1">
                    <div className="text-xs text-muted-foreground">
                      {mode === 'inputs' ? cand.path : cand.nodeId}
                      {mode === 'inputs' && <> · type: {(cand as InputCandidate).inferredType}</>}
                    </div>
                    <div className="font-medium">
                      {cand.nodeTitle}
                      {mode === 'inputs' && ` ·  + ${(cand as InputCandidate).propKey}`}
                    </div>
                  </div>
                </label>
                {selected && (
                  <div className="ml-6 mt-1 grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center gap-1 col-span-2">
                      <span className="shrink-0">key</span>
                      <input
                        className="w-full px-2 py-1 border rounded"
                        value={keyDraft}
                        onChange={e => setDrafts(d => ({ ...d, [path]: e.target.value }))}
                        onBlur={() => onCommitKey(path)}
                      />
                    </div>
                    {mode === 'inputs' && (
                      <div className="flex items-center gap-1 col-span-2">
                        <span className="shrink-0">type</span>
                        <select
                          className="w-full px-2 py-1 border rounded"
                          value={selected.type}
                          onChange={e => control.updateType(path, e.target.value as PrimitiveType)}
                        >
                          <option value="string">string</option>
                          <option value="number">number</option>
                          <option value="boolean">boolean</option>
                        </select>
                      </div>
                    )}
                    {mode === 'inputs' && (
                      <div className="col-span-2 text-xs text-muted-foreground">
                        default: <code>{String((cand as InputCandidate).defaultValue)}</code>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </Drag.NoDrag>
  )
}
