
import {
  SerializableInputsNode,
  type TypedSocket,
} from 'renderer/nodeEditor/types'
import type { WorkflowInputs } from '@nodes/ComfyUI/common/shared'

/**
 * MergeWorkflowInputsDefaults
 * - inputs:
 *   - workflowInputs: WorkflowInputs
 *   - object: object
 * - outputs:
 *   - workflowInputs: WorkflowInputs (default を object の値で上書き)
 */
export class MergeWorkflowInputsDefaultsNode extends SerializableInputsNode<
  'MergeWorkflowInputsDefaults',
  { workflowInputs: TypedSocket; object: TypedSocket },
  { workflowInputs: TypedSocket },
  object
> {
  constructor() {
    super('MergeWorkflowInputsDefaults')
    this.addInputPort([
      { key: 'workflowInputs', typeName: 'WorkflowInputs', label: 'WorkflowInputs' },
      { key: 'object', typeName: 'object', label: 'Object' },
    ])

    this.addOutputPort({ key: 'workflowInputs', typeName: 'WorkflowInputs', label: 'WorkflowInputs' })
  }

  /**
   * data(): WorkflowInputs と object をマージして返す。
   * - object[key] が undefined でない場合のみ default を置き換える（false/0/'' は有効値として上書き）
   * - 余分な key は無視し、workflowInputs に存在する key のみを出力
   */
  data(inputs: Record<string, unknown>): { workflowInputs: WorkflowInputs } {
    const base = this.getInputValue<WorkflowInputs>(inputs, 'workflowInputs') || {}
    const obj = this.getInputValue<Record<string, unknown>>(inputs, 'object') || {}

    const merged: WorkflowInputs = {}
    for (const [key, info] of Object.entries(base)) {
      const val = (obj as any)[key]
      // undefined のときは上書きしない。null/false/0/'' は有効値として上書き。
      merged[key] = {
        path: (info as any).path,
        ...((val !== undefined)
          ? { default: val }
          : ((info as any).default !== undefined ? { default: (info as any).default } : {})),
      } as any
    }

    return { workflowInputs: merged }
  }
}
