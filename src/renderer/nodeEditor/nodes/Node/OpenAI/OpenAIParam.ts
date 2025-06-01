import type OpenAI from "openai";
import type { AreaPlugin } from "rete-area-plugin";
import type { HistoryPlugin } from "rete-history-plugin";
import type { DataflowEngine } from "rete-engine";
import { InputValueControl } from "../../Controls/input/InputValue";
import { resetCacheDataflow } from "../../util/resetCacheDataflow";
import { CheckBoxControl } from "../../Controls/input/CheckBox";
import { getInputValue } from "../../util/getInput";
import {
  type AreaExtra,
  type TypedSocket,
  type Schemes,
  SerializableInputsNode,
  type TooltipInput,
} from "renderer/nodeEditor/types";
import { type, type Type } from "arktype";
import { SelectControl } from "../../Controls/input/Select";
import type { ResponseCreateParamsBase } from "openai/resources/responses/responses.mjs";
import { createParamsSchemas } from "renderer/nodeEditor/types/Schemas/createParams";

type OpenAIParamKeys = keyof ResponseCreateParamsBase;

// Run ノード
export class OpenAIParamNode extends SerializableInputsNode<
  Record<OpenAIParamKeys, TypedSocket>,
  { param: TypedSocket },
  object
> {
  constructor(
    private history: HistoryPlugin<Schemes>,
    private area: AreaPlugin<Schemes, AreaExtra>,
    private dataflow: DataflowEngine<Schemes>
  ) {
    super("OpenAIParam");

    const opts = {
      history,
      area,
      editable: true,
      onChange: () => resetCacheDataflow(dataflow, this.id),
    };

    this.addInputPort([
      {
        key: "input",
        schemaSpec: createParamsSchemas.Input,
        label: "input (required)",
        showControl: true,
        require: true,
        tooltip:
          "OpenAI APIに送るメッセージや、チャットコンテキスト、コンテンツ",
        control: new InputValueControl<string>({
          value: "hello!",
          type: "string",
          label: "input (required)",
          ...opts,
        }),
      },
      {
        key: "model",
        schemaSpec: createParamsSchemas.Model,
        label: "model (required)",
        showControl: true,
        require: true,
        tooltip:
          "使用するモデルID。詳しくは[モデルガイド](https://platform.openai.com/docs/models)参照。",
        control: new InputValueControl<string>({
          value: "gpt-4.1",
          type: "string",
          label: "model (required)",
          ...opts,
        }),
      },
      {
        key: "stream",
        schemaSpec: createParamsSchemas.Stream,
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
        schemaSpec: createParamsSchemas.Store,
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
        schemaSpec: createParamsSchemas.Instructions,
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
        schemaSpec: createParamsSchemas.ServiceTier,
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
        schemaSpec: createParamsSchemas.Truncation,
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
      // 追加のOpenAIパラメータ
      {
        key: "background",
        schemaSpec: createParamsSchemas.Background,
        label: "background",
        tooltip: "モデルの応答を**バックグラウンド**で実行するかどうか。",
      },
      {
        key: "include",
        schemaSpec: createParamsSchemas.Include,
        label: "include",
        tooltip:
          "応答に含める追加データを指定する**キー配列**。詳細：[ドキュメント](https://platform.openai.com/docs/api-reference/responses/create#responses/create-include)",
      },
      {
        key: "max_output_tokens",
        schemaSpec: createParamsSchemas.MaxOutputTokens,
        label: "max_output_tokens",
        tooltip: "生成する**トークン数の上限**。",
      },
      {
        key: "metadata",
        schemaSpec: createParamsSchemas.Metadata,
        label: "metadata",
        tooltip: "**キー:文字列、値:文字列**のメタデータ（最大16組）。",
      },
      {
        key: "parallel_tool_calls",
        schemaSpec: createParamsSchemas.ParallelToolCalls,
        label: "parallel_tool_calls",
        tooltip: "ツール実行を**並列**で行うかどうか。",
      },
      {
        key: "previous_response_id",
        schemaSpec: createParamsSchemas.PreviousResponseId,
        label: "previous_response_id",
        tooltip: "前回の応答ID。**マルチターン会話**用。",
      },
      {
        key: "reasoning",
        schemaSpec: createParamsSchemas.Reasoning,
        label: "reasoning",
        tooltip: "**oシリーズモデル**の推論オプション。",
      },
      {
        key: "temperature",
        schemaSpec: createParamsSchemas.Temperature,
        label: "temperature",
        tooltip: "出力の**ランダム性**を制御する温度パラメータ（0〜2）。",
      },
      {
        key: "text",
        schemaSpec: createParamsSchemas.ResponseTextConfig,
        label: "text",
        tooltip: "テキスト応答の書式を設定する**オブジェクト**。",
      },
      {
        key: "tool_choice",
        schemaSpec: createParamsSchemas.ToolChoice,
        label: "tool_choice",
        tooltip: "使用するツールを**指定**。",
      },
      {
        key: "tools",
        schemaSpec: createParamsSchemas.ToolsList,
        label: "tools",
        tooltip: "実行可能な**ツールの配列**。",
      },
      {
        key: "top_p",
        schemaSpec: createParamsSchemas.TopP,
        label: "top_p",
        tooltip: "核サンプリングの**確率質量上位閾値**（0〜1）。",
      },
      {
        key: "user",
        schemaSpec: createParamsSchemas.User,
        label: "user",
        tooltip: "エンドユーザーの**一意識別子**。",
      },
    ]);

    this.addOutputPort({
      key: "param",
      schemaSpec: "ResponseCreateParamsBase",
    });
    // 初期スキーマ設定
    this.updateParamSchema();
  }

  /**
   * 入力ポートの接続状況および表示コントロールから動的にパラメータ型スキーマを構築し、出力ソケットに設定する
   */
  public updateParamSchema(
    area: AreaPlugin<Schemes, AreaExtra> | null = null
  ): void {
    const schemas: Type[] = [];
    // 各入力ポートをチェック
    for (const [key, input] of Object.entries(this.inputs) as [
      string,
      TooltipInput<TypedSocket>
    ][]) {
      const socket = input.socket;
      // 接続済みまたはコントロール表示中の入力を対象
      if (socket.isConnected || (input.control && input.showControl)) {
        // 各キーごとにオブジェクト型スキーマを作成して収集
        if (input.require) {
          schemas.push(type({ [key]: socket.getSchema() }));
        } else {
          schemas.push(type({ [`${key}?`]: socket.getSchema() }));
        }
      }
    }
    // スキーマをマージ
    const combined = schemas.length
      ? schemas.reduce((a, b) => a.and(b))
      : type({});
    // combined.and({ "[string]": "never" });
    // 出力ソケットに設定
    this.outputs.param?.socket.setSchema(combined);

    if (area) area.update("node", this.id);
  }

  connected(): void {
    console.log("OpenAIParamNode connected");
    this.updateParamSchema(this.area);
  }

  disconnected(): void {
    console.log("OpenAIParamNode disconnected");
    this.updateParamSchema(this.area);
  }

  data(inputs: Partial<Record<OpenAIParamKeys, unknown[]>>): {
    param: OpenAI.Responses.ResponseCreateParams;
  } {
    const param: Partial<OpenAI.Responses.ResponseCreateParams> = {};

    for (const key of Object.keys(this.inputs) as OpenAIParamKeys[]) {
      const value = getInputValue(this.inputs, key, inputs);
      if (value !== undefined) {
        (param as any)[key] = value;
      }
    }

    return { param: param as OpenAI.Responses.ResponseCreateParams };
  }
  async execute(): Promise<void> {}
}
