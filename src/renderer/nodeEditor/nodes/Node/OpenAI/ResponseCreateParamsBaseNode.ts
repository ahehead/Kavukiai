import { type TSchema, Type } from "@sinclair/typebox";
import type OpenAI from "openai";
import type {
  AreaExtra,
  Schemes,
  TypedSocket,
} from "renderer/nodeEditor/types";
import type { DynamicSchemaNode } from "renderer/nodeEditor/types/Node/DynamicSchemaNode";
import { SerializableInputsNode } from "renderer/nodeEditor/types/Node/SerializableInputsNode";
import { ResponseCreateParamsBase } from "renderer/nodeEditor/types/Schemas/openai/RequestSchemas";
import type { AreaPlugin } from "rete-area-plugin";
import type { DataflowEngine } from "rete-engine";
import type { HistoryPlugin } from "rete-history-plugin";
import { CheckBoxControl } from "../../Controls/input/CheckBox";
import { InputValueControl } from "../../Controls/input/InputValue";
import { SelectControl } from "../../Controls/input/Select";
import { getInputValue } from "../../util/getInput";
import { resetCacheDataflow } from "../../util/resetCacheDataflow";

type OpenAIParamKeys = keyof ResponseCreateParamsBase;
// Run ノード
export class ResponseCreateParamsBaseNode
  extends SerializableInputsNode<
    "ResponseCreateParamsBase",
    Record<OpenAIParamKeys, TypedSocket>,
    { param: TypedSocket },
    object
  >
  implements DynamicSchemaNode
{
  constructor(
    history: HistoryPlugin<Schemes>,
    private area: AreaPlugin<Schemes, AreaExtra>,
    dataflow: DataflowEngine<Schemes>
  ) {
    super("ResponseCreateParamsBase");

    const opts = {
      history,
      area,
      editable: true,
      onChange: () => resetCacheDataflow(dataflow, this.id),
    };

    this.addInputPort([
      {
        key: "input",
        typeName: "input",
        schema: Type.Index(ResponseCreateParamsBase, ["input"]),
        label: "input",
        showControl: true,
        require: true,
        tooltip:
          "OpenAI APIに送るメッセージや、チャットコンテキスト、コンテンツ",
        control: new InputValueControl<string>({
          value: "hello!",
          type: "string",
          label: "input",
          ...opts,
        }),
      },
      {
        key: "model",
        typeName: "model",
        schema: Type.Index(ResponseCreateParamsBase, ["model"]),
        label: "model",
        showControl: true,
        require: true,
        tooltip:
          "使用するモデルID。詳しくは[モデルガイド](https://platform.openai.com/docs/models)参照。",
        control: new InputValueControl<string>({
          value: "gpt-4.1",
          type: "string",
          label: "model",
          ...opts,
        }),
      },
      {
        key: "stream",
        typeName: "stream",
        schema: Type.Index(ResponseCreateParamsBase, ["stream"]),
        label: "stream",
        tooltip: "応答を**ストリーム**形式で受け取るか。",
        control: new CheckBoxControl({
          value: true,
          label: "stream",
          ...opts,
        }),
      },
      {
        key: "store",
        typeName: "store",
        schema: Type.Index(ResponseCreateParamsBase, ["store"]),
        label: "store",
        tooltip: "会話履歴をOpenAIに**保存**して運用するか。",
        control: new CheckBoxControl({
          value: false,
          label: "store",
          ...opts,
        }),
      },
      {
        key: "instructions",
        typeName: "instructions",
        schema: Type.Index(ResponseCreateParamsBase, ["instructions"]),
        label: "instructions",
        tooltip: "最初に挿入する**システムメッセージ**。",
        control: new InputValueControl<string>({
          value: "",
          type: "string",
          label: "instructions",
          ...opts,
        }),
      },
      {
        key: "service_tier",
        typeName: "service_tier",
        schema: Type.Index(ResponseCreateParamsBase, ["service_tier"]),
        label: "service_tier",
        tooltip: "処理レイテンシの**ティア** (auto/default/flex)。",
        control: new SelectControl<"auto" | "default" | "flex">({
          value: "auto",
          optionsList: [
            { label: "auto", value: "auto" },
            { label: "default", value: "default" },
            { label: "flex", value: "flex" },
          ],
          label: "service_tier",
          ...opts,
        }),
      },
      {
        key: "truncation",
        typeName: "truncation",
        schema: Type.Index(ResponseCreateParamsBase, ["truncation"]),
        label: "truncation",
        tooltip: "コンテキスト過剰時の**コンテキスト切り詰め戦略**。",
        control: new SelectControl<"auto" | "disabled">({
          value: "auto",
          optionsList: [
            { label: "auto", value: "auto" },
            { label: "disabled", value: "disabled" },
          ],
          label: "truncation",
          ...opts,
        }),
      },
      {
        key: "background",
        typeName: "background",
        schema: Type.Index(ResponseCreateParamsBase, ["background"]),
        label: "background",
        tooltip: "モデルの応答を**バックグラウンド**で実行するかどうか。",
        control: new CheckBoxControl({
          value: false,
          label: "background",
          ...opts,
        }),
      },
      {
        key: "include",
        typeName: "include",
        schema: Type.Index(ResponseCreateParamsBase, ["include"]),
        label: "include",
        tooltip:
          "応答に含める追加データを指定する**キー配列**。詳細：[ドキュメント](https://platform.openai.com/docs/api-reference/responses/create#responses/create-include)",
      },
      {
        key: "max_output_tokens",
        typeName: "max_output_tokens",
        schema: Type.Index(ResponseCreateParamsBase, ["max_output_tokens"]),
        label: "max_output_tokens",
        tooltip: "生成する**トークン数の上限**。",
        control: new InputValueControl<number>({
          value: 1024,
          type: "number",
          label: "max_output_tokens",
          ...opts,
        }),
      },
      {
        key: "metadata",
        typeName: "metadata",
        schema: Type.Index(ResponseCreateParamsBase, ["metadata"]),
        label: "metadata",
        tooltip: "**キー:文字列、値:文字列**のメタデータ（最大16組）。",
      },
      {
        key: "parallel_tool_calls",
        typeName: "parallel_tool_calls",
        schema: Type.Index(ResponseCreateParamsBase, ["parallel_tool_calls"]),
        label: "parallel_tool_calls",
        tooltip: "ツール実行を**並列**で行うかどうか。",
        control: new CheckBoxControl({
          value: false,
          label: "parallel_tool_calls",
          ...opts,
        }),
      },
      {
        key: "previous_response_id",
        typeName: "previous_response_id",
        schema: Type.Index(ResponseCreateParamsBase, ["previous_response_id"]),
        label: "previous_response_id",
        tooltip: "前回の応答ID。**マルチターン会話**用。",
      },
      {
        key: "reasoning",
        typeName: "reasoning",
        schema: Type.Index(ResponseCreateParamsBase, ["reasoning"]),
        label: "reasoning",
        tooltip: "**oシリーズモデル**の推論オプション。",
      },
      {
        key: "temperature",
        typeName: "temperature",
        schema: Type.Index(ResponseCreateParamsBase, ["temperature"]),
        label: "temperature",
        tooltip:
          "出力の**ランダム性**を制御する温度パラメータ（0〜2）。top_pと併用不可。",
        control: new InputValueControl<number>({
          value: 1,
          step: 0.01,
          type: "number",
          label: "temperature",
          ...opts,
        }),
      },
      {
        key: "text",
        typeName: "ResponseTextConfig",
        schema: Type.Index(ResponseCreateParamsBase, ["text"]),
        label: "text",
        tooltip: "テキスト応答の書式を設定する**オブジェクト**。",
      },
      {
        key: "tool_choice",
        typeName: "tool_choice",
        schema: Type.Index(ResponseCreateParamsBase, ["tool_choice"]),
        label: "tool_choice",
        tooltip: "使用するツールを**指定**。",
      },
      {
        key: "tools",
        typeName: "tools",
        schema: Type.Index(ResponseCreateParamsBase, ["tools"]),
        label: "tools",
        tooltip: "実行可能な**ツールの配列**。",
      },
      {
        key: "top_p",
        typeName: "top_p",
        schema: Type.Index(ResponseCreateParamsBase, ["top_p"]),
        label: "top_p",
        tooltip:
          "核サンプリングの**確率質量上位閾値**（0〜1）。temperatureと併用不可。",
        control: new InputValueControl<number>({
          value: 1,
          step: 0.01,
          type: "number",
          label: "top_p",
          ...opts,
        }),
      },
      {
        key: "user",
        typeName: "user",
        schema: Type.Index(ResponseCreateParamsBase, ["user"]),
        label: "user",
        tooltip: "エンドユーザーの**一意識別子**。",
      },
    ]);

    this.addOutputPort({
      key: "param",
      typeName: "object",
      schema: ResponseCreateParamsBase,
    });
    // 初期スキーマ設定
    void this.setupSchema();
  }

  public async onConnectionChangedSchema(): Promise<string[]> {
    await this.setupSchema();
    await this.area.update("node", this.id);
    return ["param"];
  }
  /**
   * 入力ポートの接続状況および表示コントロールから動的にパラメータ型スキーマを構築し、出力ソケットに設定する
   */
  public async setupSchema(): Promise<void> {
    // 接続中 or コントロール表示中の入力だけを抽出して
    // { key: schema } というオブジェクトを構築
    const schemas: Record<string, TSchema> = Object.fromEntries(
      Object.entries(this.inputs)
        .filter(
          ([, input]) =>
            input.socket.isConnected || (input.control && input.showControl)
        )
        .map(([key, input]) => [key, input.socket.getSchema()])
    );

    // 出力スキーマを反映
    await this.outputs.param?.socket.setSchema("object", Type.Object(schemas));
  }

  data(inputs: Partial<Record<OpenAIParamKeys, unknown[]>>): {
    param: OpenAI.Responses.ResponseCreateParams;
  } {
    const param: Partial<OpenAI.Responses.ResponseCreateParams> = {};

    for (const key of Object.keys(this.inputs) as OpenAIParamKeys[]) {
      const value = getInputValue(this.inputs, key, inputs);
      if (value !== undefined) {
        param[key] = value;
      }
    }

    return { param: param as OpenAI.Responses.ResponseCreateParams };
  }
  async execute(): Promise<void> {}
}
