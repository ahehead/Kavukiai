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
} from "renderer/nodeEditor/types";
import { type } from "arktype";
import { SelectControl } from "../../Controls/input/Select";
import type { ResponseCreateParamsBase } from "openai/resources/responses/responses.mjs";

type OpenAIParamKeys = keyof ResponseCreateParamsBase;

// Run ノード
export class OpenAIParamNode extends SerializableInputsNode<
  Record<OpenAIParamKeys, TypedSocket>,
  { param: TypedSocket },
  object
> {
  constructor(
    history: HistoryPlugin<Schemes>,
    area: AreaPlugin<Schemes, AreaExtra>,
    dataflow: DataflowEngine<Schemes>
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
        schemaSpec: ["string", "chatContext"],
        label: "input (required)",
        showControl: true,
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
        schemaSpec: "string",
        label: "model (required)",
        showControl: true,
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
        schemaSpec: "boolean",
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
        schemaSpec: "boolean",
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
        schemaSpec: "string",
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
        schemaSpec: type("'auto' | 'default' | 'flex'"),
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
        schemaSpec: type("'auto' | 'disabled' | null"),
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
        schemaSpec: ["boolean", "null"],
        label: "background",
        tooltip: "モデルの応答を**バックグラウンド**で実行するかどうか。",
      },
      {
        key: "include",
        schemaSpec: ["string[]", "null"],
        label: "include",
        tooltip:
          "応答に含める追加データを指定する**キー配列**。詳細：[ドキュメント](https://platform.openai.com/docs/api-reference/responses/create#responses/create-include)",
      },
      {
        key: "max_output_tokens",
        schemaSpec: ["number", "null"],
        label: "max_output_tokens",
        tooltip: "生成する**トークン数の上限**。",
      },
      {
        key: "metadata",
        schemaSpec: ["object", "null"],
        label: "metadata",
        tooltip: "**キー:文字列、値:文字列**のメタデータ（最大16組）。",
      },
      {
        key: "parallel_tool_calls",
        schemaSpec: ["boolean", "null"],
        label: "parallel_tool_calls",
        tooltip: "ツール実行を**並列**で行うかどうか。",
      },
      {
        key: "previous_response_id",
        schemaSpec: ["string", "null"],
        label: "previous_response_id",
        tooltip: "前回の応答ID。**マルチターン会話**用。",
      },
      {
        key: "reasoning",
        schemaSpec: ["object", "null"],
        label: "reasoning",
        tooltip: "**oシリーズモデル**の推論オプション。",
      },
      {
        key: "temperature",
        schemaSpec: ["number", "null"],
        label: "temperature",
        tooltip: "出力の**ランダム性**を制御する温度パラメータ（0〜2）。",
      },
      {
        key: "text",
        schemaSpec: ["object", "null"],
        label: "text",
        tooltip: "テキスト応答の書式を設定する**オブジェクト**。",
      },
      {
        key: "tool_choice",
        schemaSpec: ["object", "null"],
        label: "tool_choice",
        tooltip: "使用するツールを**指定**。",
      },
      {
        key: "tools",
        schemaSpec: ["unknown[]", "null"],
        label: "tools",
        tooltip: "実行可能な**ツールの配列**。",
      },
      {
        key: "top_p",
        schemaSpec: ["number", "null"],
        label: "top_p",
        tooltip: "核サンプリングの**確率質量上位閾値**（0〜1）。",
      },
      {
        key: "user",
        schemaSpec: "string",
        label: "user",
        tooltip: "エンドユーザーの**一意識別子**。",
      },
    ]);

    this.addOutputPort({
      key: "param",
      schemaSpec: "ResponseCreateParamsBase",
    });
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
