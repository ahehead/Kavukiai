import { type TSchema, Type } from '@sinclair/typebox'
import type { DataflowEngine } from 'renderer/nodeEditor/features/safe-dataflow/dataflowEngin'
import { restoreKind } from 'renderer/nodeEditor/nodes/util/restoreKind'
import {
  type AreaExtra,
  type Schemes,
  SerializableInputsNode,
  type TooltipInput,
  type TypedSocket,
} from 'renderer/nodeEditor/types'
import type {
  ConnectionParams,
  DynamicSchemaNode,
} from 'renderer/nodeEditor/types/Node/DynamicSchemaNode'

import type { AreaPlugin } from 'rete-area-plugin'

// 配列ノード: 6つの入力を配列化し返す
export class ToArrayNode
  extends SerializableInputsNode<
    'Array',
    Record<string, TypedSocket>,
    { out: TypedSocket },
    object
  >
  implements DynamicSchemaNode {
  schemaName = 'any'
  schema: TSchema = Type.Any()
  constructor(
    private area: AreaPlugin<Schemes, AreaExtra>,
    private dataflow: DataflowEngine<Schemes>
  ) {
    super('Array')

    this.addInputPort(
      Array.from({ length: 6 }, (_, i) => ({
        key: `item${i}` as const,
        typeName: 'any',
        label: 'item',
        tooltip: 'リストアイテム',
      }))
    )

    this.addOutputPort({
      key: 'out',
      typeName: 'array',
    })
  }

  /**
   * 接続状態が変化したときに呼び出されます。
   * @param params 接続パラメータ
   * @return Promise<void>
   */
  public async onConnectionChangedSchema({
    isConnected,
    source,
  }: ConnectionParams): Promise<string[]> {
    this.dataflow.reset(this.id)
    // console.log('ListNode onConnectionChangedSchema', isConnected, source, target);
    if (isConnected) {
      if (this.isConnectedFirst(this.inputs)) {
        await this.updateSchema(
          this.inputs,
          source.getName(),
          source.getSchema()
        )
      } else {
        await this.updateSchema(this.inputs, this.schemaName, this.schema)
      }
    } else {
      if (this.isNotConnectedInput(this.inputs)) {
        await this.updateSchema(this.inputs, 'any', Type.Any())
      }
    }
    await this.area.update('node', this.id)
    return ['out']
  }

  /**
   * スキーマをセットアップします。
   * ロード時に呼び出されます。
   * @return Promise<void>
   */
  public async setupSchema(): Promise<void> {
    await this.updateSchema(this.inputs, this.schemaName, this.schema)
  }

  /**
   * 入出力のスキーマを更新します。
   * @param inputs 入力のオブジェクト
   * @param schemaName スキーマ名
   * @param schema スキーマ
   */
  public async updateSchema(
    inputs: Record<string, TooltipInput<TypedSocket> | undefined>,
    schemaName: string,
    schema: TSchema
  ): Promise<void> {
    await this.updateInputsSchema(inputs, schemaName, schema)
    await this.updateOutSchema(
      'out',
      `<${schemaName}>Array`,
      Type.Array(schema)
    )
    this.schemaName = schemaName
    this.schema = schema
  }

  /**
   * input portのスキーマを更新します。
   * @param inputs inputsのオブジェクト
   * @param schemaName スキーマ名
   * @param schema スキーマ
   */
  public async updateInputsSchema(
    inputs: Record<string, TooltipInput<TypedSocket> | undefined>,
    schemaName: string,
    schema: TSchema
  ) {
    for (const input of Object.values(inputs)) {
      await input?.socket.setSchema(schemaName, schema)
    }
  }

  /**
   * output portのスキーマを更新します。
   * @param outputKey 出力ポートのキー
   * @param schemaName スキーマ名
   * @param schema スキーマ
   */
  public async updateOutSchema(
    outputKey: 'out',
    schemaName: string,
    schema: TSchema
  ): Promise<void> {
    await this.outputs[outputKey]?.socket.setSchema(schemaName, schema)
  }

  /**
   * 入力ポートがすべて未接続であるかを確認します。
   * @param inputs 入力のオブジェクト
   * @returns すべて未接続ならtrue
   */
  public isNotConnectedInput(
    inputs: Record<string, TooltipInput<TypedSocket> | undefined>
  ): boolean {
    return Object.values(inputs).every(input =>
      input ? !input.socket.isConnected : true
    )
  }

  /**
   * 入力ポートが1つだけ接続されているかを確認します。
   * @param inputs 入力のオブジェクト
   * @returns 1つだけ接続されていればtrue
   */
  public isConnectedFirst(
    inputs: Record<string, TooltipInput<TypedSocket> | undefined>
  ): boolean {
    return (
      Object.values(inputs).filter(input =>
        input ? input.socket.isConnected : false
      ).length === 1
    )
  }

  public data(inputs: Partial<Record<string, unknown[]>>): { out: unknown[] } {
    // console.log('ListNode data', inputs);
    return {
      out: Object.keys(inputs)
        .sort()
        .flatMap(k => inputs[k] || []),
    }
  }

  serializeControlValue(): { schemaName: string; schema: TSchema } {
    return {
      schemaName: this.schemaName,
      schema: this.schema,
    }
  }

  deserializeControlValue(data: { schemaName: string; schema: TSchema }): void {
    this.schemaName = data.schemaName
    this.schema = restoreKind(data.schema)
  }
}
