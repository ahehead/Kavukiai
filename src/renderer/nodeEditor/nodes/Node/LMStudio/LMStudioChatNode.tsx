import { electronApiService } from 'renderer/features/services/appService'
import type { DataflowEngine } from 'renderer/nodeEditor/features/safe-dataflow/dataflowEngin'
import type { AreaExtra, Schemes, TypedSocket } from 'renderer/nodeEditor/types'
import { MessagePortNode } from 'renderer/nodeEditor/types/Node/MessagePortNode'
import type { LMStudioChatPortEventOrNull } from "renderer/nodeEditor/types/Schemas/LMStudioChatPortEventOrNull"
import {
  type ChatHistoryData,
  ChatHistoryData as ChatHistoryDataSchema,
  type LLMPredictionConfig,
  LLMPredictionConfig as LLMPredictionConfigSchema,
} from 'renderer/nodeEditor/types/Schemas/lmstudio/LMStudioSchemas'
import type { AreaPlugin } from 'rete-area-plugin'
import type { ControlFlowEngine } from 'rete-engine'
import type {
  LMStudioChatPortEvent,
  LMStudioChatRequestArgs,
} from 'shared/ApiType'
import { ConsoleControl } from '../../Controls/Console'

export class LMStudioChatNode extends MessagePortNode<
  'LMStudioChat',
  {
    exec: TypedSocket,
    exec2: TypedSocket
    modelKey: TypedSocket
    chatHistoryData: TypedSocket
    config: TypedSocket
  },
  { exec: TypedSocket; eventOrStatus: TypedSocket },
  { console: ConsoleControl },
  LMStudioChatPortEvent,
  LMStudioChatRequestArgs
> {
  eventOrStatus: LMStudioChatPortEventOrNull = null

  constructor(
    area: AreaPlugin<Schemes, AreaExtra>,
    dataflow: DataflowEngine<Schemes>,
    controlflow: ControlFlowEngine<Schemes>
  ) {
    super('LMStudioChat', area, dataflow, controlflow)
    this.addInputPortPattern({
      type: 'RunButton',
      controlflow: this.controlflow,
    })
    this.addInputPort([
      {
        key: 'exec2', typeName: 'exec', label: 'Stop',
        onClick: () => this.controlflow.execute(this.id, 'exec2'),
      },
      { key: 'modelKey', typeName: 'string', label: 'modelKey', tooltip: 'Model key to use for the chat' },
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
      {
        key: 'eventOrStatus',
        typeName: 'LMStudioChatPortEventOrNull',
        label: 'Event',
      },
    ])
    this.addControl('console', new ConsoleControl({}))
  }

  async data() { return {} };

  async dataWithFetch(_fetchInputs: any) {
    return { eventOrStatus: this.eventOrStatus }
  }

  protected async buildRequestArgs(): Promise<LMStudioChatRequestArgs | null> {
    const [modelKey, chatHistoryData, config] =
      await this.dataflow.fetchInputMultiple<[string, ChatHistoryData, LLMPredictionConfig]>(this.id, ["modelKey", "chatHistoryData", "config"])
    if (!chatHistoryData) return null
    this.controls.console.setValue(`modelKey: ${modelKey} \n config: ${JSON.stringify(config)} \n chatHistoryData: ${JSON.stringify(chatHistoryData)} `)
    return {
      id: this.id,
      modelKey: modelKey ? modelKey : undefined,
      chatHistoryData,
      config: config ? config : undefined,
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
      case 'start':
        this.eventOrStatus = evt
        this.controls.console.addValue(`Event: ${evt.type}`)
        this.dataflow.reset(this.id)
        forward('exec')
        break
      case 'stream':
        this.eventOrStatus = evt
        this.controls.console.addValue(`Event: ${evt.type}`)
        this.dataflow.reset(this.id)
        forward('exec')
        break
      case 'finish':
        this.eventOrStatus = evt
        this.controls.console.addValue(`Event: ${evt.type}`)
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
