import { ClassicPreset } from "rete";
import type OpenAI from "openai";
import type { AreaPlugin } from "rete-area-plugin";
import type { HistoryPlugin } from "rete-history-plugin";
import type { DataflowEngine } from "rete-engine";
import { InputValueControl } from "../../Controls/InputValue";
import { resetCacheDataflow } from "../../util/resetCacheDataflow";
import { CheckBoxControl } from "../../Controls/CheckBox";
import { getInputValue } from "../../util/getInput";
import {
  type AreaExtra,
  createSocket,
  type NodeSocket,
  type Schemes,
  SerializableInputsNode,
} from "renderer/nodeEditor/types";
import type { OpenAIInput } from "../../Controls/ChatContext/ChatContext";
import { type } from "arktype";
import { SelectControl } from "../../Controls/Select";
const { Output, Input } = ClassicPreset;

// Run ノード
export class OpenAIParamNode extends SerializableInputsNode<
  {
    openaiInput: NodeSocket;
    model: NodeSocket;
    stream: NodeSocket;
    store: NodeSocket;
    temperature: NodeSocket;
    serviceTier: NodeSocket;
  },
  { param: NodeSocket },
  object
> {
  value = "";
  constructor(
    history: HistoryPlugin<Schemes>,
    area: AreaPlugin<Schemes, AreaExtra>,
    dataflow: DataflowEngine<Schemes>
  ) {
    super("OpenAIParam");
    this.addOutput(
      "param",
      new Output(createSocket("OpenAIParam"), undefined, true)
    );
    this.addInput(
      "openaiInput",
      new Input(createSocket(["string", "chatContext"]), "input", false)
    );
    this.addInput(
      "model",
      new Input(createSocket("string"), 'model (Default "gpt-4.1")', false)
    );
    this.inputs.model?.addControl(
      new InputValueControl<string>("gpt-4.1", {
        type: "string",
        label: 'model (Default "gpt-4.1")',
        editable: true,
        history: history,
        area: area,
        onChange: (v: string) => {
          resetCacheDataflow(dataflow, this.id);
        },
      })
    );
    this.addInput(
      "stream",
      new Input(createSocket("boolean"), "stream", false)
    );
    this.inputs.stream?.addControl(
      new CheckBoxControl(true, {
        label: "stream",
        editable: true,
        history: history,
        area: area,
        onChange: (v: boolean) => {
          resetCacheDataflow(dataflow, this.id);
        },
      })
    );
    this.addInput("store", new Input(createSocket("boolean"), "store", false));
    this.inputs.store?.addControl(
      new CheckBoxControl(false, {
        label: "store",
        editable: false,
        history: history,
        area: area,
        onChange: (v: boolean) => {
          resetCacheDataflow(dataflow, this.id);
        },
      })
    );
    this.addInput(
      "serviceTier",
      new Input(
        createSocket(type("'auto' | 'default' | 'flex'")),
        "service_tier",
        false
      )
    );
    this.inputs.serviceTier?.addControl(
      new SelectControl<"auto" | "default" | "flex">(
        "auto",
        [
          { label: "auto", value: "auto" },
          { label: "default", value: "default" },
          { label: "flex", value: "flex" },
        ],
        { label: "service_tier" }
      )
    );
  }

  data(inputs: {
    openaiInput?: OpenAIInput[];
    model?: string[];
    stream?: boolean[];
    store?: boolean[];
    temperature?: number[];
  }): { param: OpenAI.Responses.ResponseCreateParams } {
    const stream = getInputValue(this.inputs, "stream", inputs);
    const store = getInputValue(this.inputs, "store", inputs);
    const param: OpenAI.Responses.ResponseCreateParams = {
      model: getInputValue(this.inputs, "model", inputs) ?? "gpt-4.1",
      input: inputs.openaiInput?.[0] || "",
      ...(stream !== undefined && { stream }),
      ...(store !== undefined && { store }),
    };
    return { param };
  }
  async execute(): Promise<void> {}
}
