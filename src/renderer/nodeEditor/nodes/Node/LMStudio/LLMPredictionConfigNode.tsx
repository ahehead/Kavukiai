import { Type } from '@sinclair/typebox'
import type { DataflowEngine } from 'renderer/nodeEditor/features/safe-dataflow/dataflowEngin'
import {
  type Schemes,
  SerializableInputsNode,
  type TypedSocket,
} from 'renderer/nodeEditor/types'

import {
  LLMPredictionConfig,
  type LLMPredictionConfig as LLMPredictionConfigType,
} from 'renderer/nodeEditor/types/Schemas/lmstudio/LMStudioSchemas'
import { InputValueControl } from '../../Controls/input/InputValue'
import { SelectControl } from '../../Controls/input/Select'

// Node that builds LLMPredictionConfig object for LMStudio
export class LLMPredictionConfigNode extends SerializableInputsNode<
  'LLMPredictionConfig',
  Record<LLMPredictionConfigKey, TypedSocket>,
  { config: TypedSocket },
  object
> {
  constructor(private dataflow: DataflowEngine<Schemes>) {
    super('LLMPredictionConfig')

    const opts = {
      editable: true,
      onChange: () => this.dataflow.reset(this.id),
    }

    this.addInputPort([
      {
        key: 'maxTokens',
        typeName: 'number',
        schema: Type.Index(LLMPredictionConfig, ['maxTokens']),
        label: 'maxTokens',
        showControl: false,
        control: new InputValueControl<number>({
          value: 4096,
          type: 'number',
          label: 'maxTokens',
          ...opts,
        }),
      },
      {
        key: 'temperature',
        typeName: 'number',
        schema: Type.Index(LLMPredictionConfig, ['temperature']),
        label: 'temperature',
        showControl: false,
        control: new InputValueControl<number>({
          value: 1,
          type: 'number',
          step: 0.01,
          label: 'temperature',
          ...opts,
        }),
      },
      {
        key: 'stopStrings',
        typeName: 'StringArray',
        schema: Type.Index(LLMPredictionConfig, ['stopStrings']),
        label: 'stopStrings',
      },
      {
        key: 'toolCallStopStrings',
        typeName: 'StringArray',
        schema: Type.Index(LLMPredictionConfig, ['toolCallStopStrings']),
        label: 'toolCallStopStrings',
      },
      {
        key: 'contextOverflowPolicy',
        typeName: 'contextOverflowPolicy',
        schema: Type.Index(LLMPredictionConfig, ['contextOverflowPolicy']),
        label: 'contextOverflowPolicy',
        showControl: false,
        control: new SelectControl<
          'stopAtLimit' | 'truncateMiddle' | 'rollingWindow'
        >({
          value: 'stopAtLimit',
          optionsList: [
            { label: 'stopAtLimit', value: 'stopAtLimit' },
            { label: 'truncateMiddle', value: 'truncateMiddle' },
            { label: 'rollingWindow', value: 'rollingWindow' },
          ],
          label: 'contextOverflowPolicy',
          ...opts,
        }),
      },
      {
        key: 'structured',
        typeName: 'JsonSchema',
        label: 'structured',
      },
    ])

    this.addOutputPort({
      key: 'config',
      typeName: 'LLMPredictionConfig',
      schema: LLMPredictionConfig,
    })
  }

  data(inputs: Partial<Record<LLMPredictionConfigKey, unknown[]>>): {
    config: LLMPredictionConfig
  } {
    const cfg: Partial<LLMPredictionConfig> = {}
    for (const key of Object.keys(this.inputs).filter(k => k !== "structured") as LLMPredictionConfigKey[]) {
      const val = this.getInputValue(inputs, key)
      if (val) cfg[key] = val
    }

    const structured = this.getInputValue<Record<string, unknown>>(inputs, 'structured')
    if (structured) cfg.structured = { type: "json", schema: structured }

    return { config: cfg as LLMPredictionConfig }
  }

  async execute(): Promise<void> { }
}

type LLMPredictionConfigKey = keyof LLMPredictionConfigType
