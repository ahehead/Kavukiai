import { electronApiService } from 'renderer/features/services/appService'
import type { DataflowEngine } from 'renderer/nodeEditor/features/safe-dataflow/dataflowEngin'
import type { AreaExtra, Schemes, TypedSocket } from 'renderer/nodeEditor/types'
import { MessagePortNode } from 'renderer/nodeEditor/types/Node/MessagePortNode'
import type { AreaPlugin } from 'rete-area-plugin'
import type { ControlFlowEngine } from 'rete-engine'
import { ConsoleControl } from '../../Controls/Console'
import {
  ChatHistoryData as ChatHistoryDataSchema,
  LLMPredictionConfig as LLMPredictionConfigSchema,
  type ChatHistoryData,
  type LLMPredictionConfig,
} from 'renderer/nodeEditor/types/Schemas/lmstudio/LMStudioSchemas'
import type {
  LMStudioChatPortEvent,
  LMStudioChatRequestArgs,
} from 'shared/ApiType'

export class LMStudioChatNode extends MessagePortNode<
  'LMStudioChat',
  {
    exec: TypedSocket
    modelKey: TypedSocket
    chatHistoryData: TypedSocket
    config: TypedSocket
  },
  { exec: TypedSocket; eventOrStatus: TypedSocket },
  { console: ConsoleControl },
  LMStudioChatPortEvent,
  LMStudioChatRequestArgs,
  'exec',
  'exec'
> {
  eventOrStatus: LMStudioChatPortEvent | null = null

  constructor(
    area: AreaPlugin<Schemes, AreaExtra>,
    dataflow: DataflowEngine<Schemes>,
    controlflow: ControlFlowEngine<Schemes>
  ) {
    super('LMStudioChat', area, dataflow, controlflow)
    this.addInputPortPattern({ type: 'RunButton', controlflow: this.controlflow })
    this.addInputPort([
      { key: 'modelKey', typeName: 'string', tooltip: 'Model key' },
      {
        key: 'chatHistoryData',
        typeName: 'ChatHistoryData',
        schema: ChatHistoryDataSchema,
        tooltip: 'Chat history data',
      },
      {
        key: 'config',
        typeName: 'LLMPredictionConfig',
        schema: LLMPredictionConfigSchema,
        tooltip: 'Prediction config',
      },
    ])
    this.addOutputPort([
      { key: 'exec', typeName: 'exec', label: 'Out' },
      { key: 'eventOrStatus', typeName: 'any', label: 'Event' },
    ])
    this.addControl('console', new ConsoleControl({}))
  }

  data() {
    return { eventOrStatus: this.eventOrStatus }
  }

  protected async buildRequestArgs(): Promise<LMStudioChatRequestArgs | null> {
    const { modelKey, chatHistoryData, config } = (await this.dataflow.fetchInputs(
      this.id
    )) as {
      modelKey?: string[]
      chatHistoryData?: ChatHistoryData[]
      config?: LLMPredictionConfig[]
    }
    if (!modelKey?.[0] || !chatHistoryData?.[0] || !config?.[0]) return null
    return {
      id: this.id,
      modelKey: modelKey[0],
      chatHistoryData: chatHistoryData[0],
      config: config[0],
    }
  }

  protected callMain(args: LMStudioChatRequestArgs): void {
    electronApiService.sendChatMessage(args)
  }

  protected async onPortEvent(
    evt: LMStudioChatPortEvent,
    forward: (output: 'exec') => void
  ): Promise<void> {
    switch (evt.type) {
      case 'stream':
        this.eventOrStatus = evt
        this.controls.console.addValue(evt.delta)
        this.dataflow.reset(this.id)
        forward('exec')
        break
      case 'done':
        this.eventOrStatus = evt
        this.controls.console.addValue('Done')
        this.dataflow.reset(this.id)
        await this.logAndTerminate('done', 'done', forward)
        break
      case 'error':
        this.eventOrStatus = evt
        await this.logAndTerminate('error', evt.message, forward)
        break
    }
  }

  protected onLog(msg: string) {
    this.controls.console.addValue(msg)
  }

  serializeControlValue() {
    return this.controls.console.toJSON()
  }

  deserializeControlValue(data: any) {
    this.controls.console.setFromJSON({ data })
  }
}

