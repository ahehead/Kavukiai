import { type JSX, useEffect, useMemo, useRef, useState } from 'react'
import {
  BaseControl,
  type ControlOptions,
  useControlValue,
} from 'renderer/nodeEditor/types'
import { Drag } from 'rete-react-plugin'
import { useStopWheel } from '../../util/useStopWheel'

export type PrimitiveType = 'string' | 'number' | 'boolean'

export type WorkflowSelectInputs = Record<
  string,
  { type: PrimitiveType; path: string; default: any }
>

export type WorkflowSelectValue = {
  workflow: unknown
  inputs: WorkflowSelectInputs
}

export interface WorkflowSelectParams
  extends ControlOptions<WorkflowSelectValue> {
  value?: WorkflowSelectValue
}

type WorkflowMap = Record<
  string,
  {
    inputs?: Record<string, unknown>
    class_type?: string
    _meta?: { title?: string }
  }
>

type Candidate = {
  path: string // e.g. "3.inputs.steps"
  nodeId: string
  propKey: string
  inferredType: PrimitiveType
  defaultValue: any
  nodeTitle: string
}

function isPrimitive(v: unknown): v is string | number | boolean {
  return (
    typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean'
  )
}

function inferType(v: unknown): PrimitiveType {
  if (typeof v === 'boolean') return 'boolean'
  if (typeof v === 'number') return 'number' // integer も number に寄せる
  return 'string'
}

function extractCandidates(workflow: unknown): Candidate[] {
  if (!workflow || typeof workflow !== 'object') return []
  const map = workflow as WorkflowMap
  const list: Candidate[] = []
  for (const [nodeId, node] of Object.entries(map)) {
    if (!node || typeof node !== 'object') continue
    const inputs = node.inputs ?? {}
    for (const [propKey, val] of Object.entries(inputs)) {
      if (!isPrimitive(val)) continue
      const path = `${nodeId}.inputs.${propKey}`
      list.push({
        path,
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

export class WorkflowSelectControl extends BaseControl<
  WorkflowSelectValue,
  WorkflowSelectParams
> {
  private value: WorkflowSelectValue

  constructor(params: WorkflowSelectParams = {}) {
    super(params)
    this.value = params.value ?? { workflow: {}, inputs: {} }
  }

  getValue(): WorkflowSelectValue {
    return this.value
  }

  setValue(v: WorkflowSelectValue): void {
    const prev = this.value
    this.value = v
    if (prev !== v) this.addHistory(prev, v)
    this.opts.onChange?.(this.value)
    this.notify()
  }

  setWorkflow(workflow: unknown): void {
    // 既存 selection は維持。存在しない path は削除。
    const candidates = extractCandidates(workflow)
    const validPaths = new Set(candidates.map(c => c.path))
    const nextInputs: WorkflowSelectInputs = {}
    for (const [k, info] of Object.entries(this.value.inputs)) {
      if (validPaths.has(info.path)) nextInputs[k] = info
    }
    this.setValue({ workflow, inputs: nextInputs })
  }

  addSelection(candidate: Candidate): void {
    const prev = this.getValue()
    // 初期 key 名（重複回避）
    let keyName = candidate.propKey
    let suffix = 2
    while (prev.inputs[keyName]) {
      keyName = `${candidate.propKey}${suffix++}`
    }
    const next: WorkflowSelectValue = {
      workflow: prev.workflow,
      inputs: {
        ...prev.inputs,
        [keyName]: {
          type: candidate.inferredType,
          path: candidate.path,
          default: candidate.defaultValue,
        },
      },
    }
    this.setValue(next)
  }

  removeSelectionByPath(path: string): void {
    const prev = this.getValue()
    const nextInputs: WorkflowSelectInputs = {}
    for (const [k, info] of Object.entries(prev.inputs)) {
      if (info.path !== path) nextInputs[k] = info
    }
    this.setValue({ workflow: prev.workflow, inputs: nextInputs })
  }

  updateKeyName(path: string, nextKey: string): void {
    if (!nextKey) return
    const prev = this.getValue()
    const existing = Object.entries(prev.inputs).find(
      ([_, v]) => v.path === path
    )
    if (!existing) return
    const [oldKey, info] = existing
    if (oldKey === nextKey) return
    if (prev.inputs[nextKey]) return // 重複は許可しない
    const { [oldKey]: _removed, ...rest } = prev.inputs
    const nextInputs: WorkflowSelectInputs = { ...rest, [nextKey]: info }
    this.setValue({ workflow: prev.workflow, inputs: nextInputs })
  }

  updateType(path: string, type: PrimitiveType): void {
    const prev = this.getValue()
    const entry = Object.entries(prev.inputs).find(([_, v]) => v.path === path)
    if (!entry) return
    const [key, info] = entry
    const nextInputs: WorkflowSelectInputs = {
      ...prev.inputs,
      [key]: { ...info, type },
    }
    this.setValue({ workflow: prev.workflow, inputs: nextInputs })
  }

  // 永続化は今回スキップ（toJSON/setFromJSON未実装）
}

export function WorkflowSelectControlView({
  data: control,
}: {
  data: WorkflowSelectControl
}): JSX.Element {
  const value = useControlValue(control)
  const candidates = useMemo(
    () => extractCandidates(value.workflow),
    [value.workflow]
  )
  const selectedByPath = useMemo(() => {
    const map = new Map<string, { key: string; type: PrimitiveType }>()
    for (const [k, info] of Object.entries(value.inputs)) {
      map.set(info.path, { key: k, type: info.type })
    }
    return map
  }, [value.inputs])

  const listRef = useRef<HTMLDivElement | null>(null)
  useStopWheel(listRef)

  const [keyDrafts, setKeyDrafts] = useState<Record<string, string>>({})

  // workflow 切替時にドラフトをクリア
  useEffect(() => setKeyDrafts({}), [value.workflow])

  const onToggle = (cand: Candidate, checked: boolean) => {
    if (checked) control.addSelection(cand)
    else control.removeSelectionByPath(cand.path)
  }

  const onCommitKey = (path: string) => {
    const draft = keyDrafts[path]
    if (draft) control.updateKeyName(path, draft)
  }

  return (
    <Drag.NoDrag>
      <div className="flex flex-col gap-1 h-full w-full">
        <div
          ref={listRef}
          className="flex-1 w-full min-h-0 overflow-y-auto border rounded p-2 bg-node-bg"
        >
          {candidates.length === 0 && (
            <div className="text-xs text-muted-foreground">
              No primitive inputs in workflow.
            </div>
          )}
          {candidates.map(cand => {
            const selected = selectedByPath.get(cand.path)
            const keyDraft =
              keyDrafts[cand.path] ?? selected?.key ?? cand.propKey
            return (
              <div key={cand.path} className="mb-1.5 border-b pb-1.5">
                <label className="flex items-center  gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={!!selected}
                    onChange={e => onToggle(cand, e.target.checked)}
                  />
                  <div className="flex-1">
                    <div className="text-xs text-muted-foreground">
                      {cand.path} · type: {cand.inferredType}
                    </div>
                    <div className="font-medium">
                      {cand.nodeTitle} · {cand.propKey}
                    </div>
                  </div>
                </label>
                {selected && (
                  <div className="ml-6 mt-1 grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center gap-1">
                      <span className="shrink-0">key</span>
                      <input
                        className="w-full px-2 py-1 border rounded"
                        value={keyDraft}
                        onChange={e =>
                          setKeyDrafts(d => ({
                            ...d,
                            [cand.path]: e.target.value,
                          }))
                        }
                        onBlur={() => onCommitKey(cand.path)}
                      />
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="shrink-0">type</span>
                      <select
                        className="w-full px-2 py-1 border rounded"
                        value={selected.type}
                        onChange={e =>
                          control.updateType(
                            cand.path,
                            e.target.value as PrimitiveType
                          )
                        }
                      >
                        <option value="string">string</option>
                        <option value="number">number</option>
                        <option value="boolean">boolean</option>
                      </select>
                    </div>
                    <div className="col-span-2 text-xs text-muted-foreground">
                      default: <code>{String(cand.defaultValue)}</code>
                    </div>
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
