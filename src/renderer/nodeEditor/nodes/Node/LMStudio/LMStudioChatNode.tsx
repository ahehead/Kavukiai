import { electronApiService } from 'renderer/features/services/appService'
import type { DataflowEngine } from 'renderer/nodeEditor/features/safe-dataflow/dataflowEngin'
import type { AreaExtra, Schemes, TypedSocket } from 'renderer/nodeEditor/types'
import { MessagePortNode } from 'renderer/nodeEditor/types/Node/MessagePortNode'
import type { LMStudioChatPortEvent } from 'renderer/nodeEditor/types/Schemas/LMStudioChatPortEventOrNull'
import {
  type ChatHistoryData,
  ChatHistoryData as ChatHistoryDataSchema,
  type LLMPredictionConfig,
  LLMPredictionConfig as LLMPredictionConfigSchema,
} from 'renderer/nodeEditor/types/Schemas/lmstudio/LMStudioSchemas'
import type { UChatCommandEventOrNull } from 'renderer/nodeEditor/types/Schemas/UChat/UChatCommand'
import { createUChatMessageFromLMStudioFinishEvent, type UChatMessage } from 'renderer/nodeEditor/types/Schemas/UChat/UChatMessage'
import type { AreaPlugin } from 'rete-area-plugin'
import type { ControlFlowEngine } from 'rete-engine'
import type { LMStudioChatRequestArgs } from 'shared/LMStudioType'
import { ConsoleControl } from '../../Controls/Console/Console'

export class LMStudioChatNode extends MessagePortNode<
  'LMStudioChat',
  {
    exec: TypedSocket
    exec2: TypedSocket
    modelKey: TypedSocket
    chatHistoryData: TypedSocket
    config: TypedSocket
  },
  { exec: TypedSocket; command: TypedSocket },
  { console: ConsoleControl },
  LMStudioChatPortEvent,
  LMStudioChatRequestArgs
> {
  // LMStudio イベントを変換後に保持する（UChatCommand 出力）
  command: UChatCommandEventOrNull = null

  constructor(
    area: AreaPlugin<Schemes, AreaExtra>,
    dataflow: DataflowEngine<Schemes>,
    controlflow: ControlFlowEngine<Schemes>
  ) {
    super('LMStudioChat', area, dataflow, controlflow)
    this.addInputPort([
      {
        key: 'exec',
        label: 'Run',
        onClick: () => this.controlflow.execute(this.id, 'exec'),
      },
      {
        key: 'exec2',
        label: 'Stop',
        onClick: () => this.controlflow.execute(this.id, 'exec2'),
      },
      {
        key: 'modelKey',
        typeName: 'string',
        label: 'modelKey',
        tooltip: 'Model key to use for the chat',
      },
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
        key: 'command',
        typeName: 'UChatCommandEventOrNull',
        label: 'Command',
      },
    ])
    this.addControl('console', new ConsoleControl({}))
  }

  async data() {
    return {}
  }

  async dataWithFetch(_fetchInputs: any) {
    return { command: this.command }
  }

  protected async buildRequestArgs(): Promise<LMStudioChatRequestArgs | null> {
    const [modelKey, chatHistoryData, config] =
      await this.dataflow.fetchInputMultiple<
        [string, ChatHistoryData, LLMPredictionConfig]
      >(this.id, ['modelKey', 'chatHistoryData', 'config'])
    if (!chatHistoryData) return null
    this.onLog(
      `modelKey: ${modelKey} \n config: ${JSON.stringify(config)} \n chatHistoryData: ${JSON.stringify(chatHistoryData)} `
    )
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
        this.command = { type: 'start' }
        this.onLog(`Event: ${evt.type}`)
        this.dataflow.reset(this.id)
        forward('exec')
        break
      case 'stream':
        this.command = { type: 'delta', delta: evt.delta }
        this.onLog(`Event: ${evt.type}`)
        this.dataflow.reset(this.id)
        forward('exec')
        break
      case 'finish': {
        // LMStudio の完了イベントを UChatCommandEvent に変換（共通関数へ委譲）
        const message: UChatMessage = createUChatMessageFromLMStudioFinishEvent(evt)
        this.command = { type: 'finish', text: evt.result.content, message }
        this.onLog(`Event: ${evt.type}`)
        this.dataflow.reset(this.id)
        await this.logAndTerminate('done', 'done', forward)
        break
      }
      case 'error':
        this.command = { type: 'error', message: evt.message }
        await this.logAndTerminate('error', evt.message, forward)
        break
      case 'abort':
        this.command = { type: 'error', message: 'aborted' }
        await this.logAndTerminate('error', 'aborted', forward)
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
