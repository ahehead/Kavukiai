import type { SafeDataflowEngine } from "renderer/nodeEditor/features/safe-dataflow/SafeDataflowEngine";
import { getInputValue } from "renderer/nodeEditor/nodes/util/getInput";
import type {
  AreaExtra,
  Schemes,
  TypedSocket,
} from "renderer/nodeEditor/types";
import type { SerializableDataNode } from "renderer/nodeEditor/types/Node/SerializableDataNode";
import { SerializableInputsNode } from "renderer/nodeEditor/types/Node/SerializableInputsNode";
import type { AreaPlugin } from "rete-area-plugin";
import type { ControlFlowEngine } from "rete-engine";
import type { HistoryPlugin } from "rete-history-plugin";
import { InputValueControl } from "../../../Controls/input/InputValue";
import { resetCacheDataflow } from "../../../util/resetCacheDataflow";

export class CounterLoopNode
  extends SerializableInputsNode<
    "CounterLoop",
    {
      exec: TypedSocket;
      start: TypedSocket;
      stop: TypedSocket;
      reset: TypedSocket;
      continue: TypedSocket;
      count: TypedSocket;
    },
    { exec: TypedSocket; count: TypedSocket },
    { count: InputValueControl<number> }
  >
  implements SerializableDataNode
{
  private counter = 0;

  constructor(
    initial: number,
    history: HistoryPlugin<Schemes>,
    area: AreaPlugin<Schemes, AreaExtra>,
    private dataflow: SafeDataflowEngine<Schemes>,
    private controlflow: ControlFlowEngine<Schemes>
  ) {
    super("CounterLoop");

    this.addInputPort([
      {
        key: "exec",
        typeName: "exec",
        label: "In",
        onClick: () => this.controlflow.execute(this.id, "exec"),
      },
      {
        key: "start",
        typeName: "exec",
        label: "Start",
        onClick: () => this.controlflow.execute(this.id, "start"),
      },
      {
        key: "stop",
        typeName: "exec",
        label: "Stop",
        onClick: () => this.controlflow.execute(this.id, "stop"),
      },
      // Add "reset" and "continue" input ports
      {
        key: "reset",
        typeName: "exec",
        label: "Reset",
        onClick: () => this.controlflow.execute(this.id, "reset"),
      },
      {
        key: "continue",
        typeName: "exec",
        label: "Continue",
        onClick: () => this.controlflow.execute(this.id, "continue"),
      },
      {
        key: "count",
        typeName: "number",
        label: "Count",
        showControl: false,
        control: new InputValueControl<number>({
          value: initial,
          cols: 1,
          label: "Counter",
          type: "number",
          editable: true,
          history,
          area,
          onChange: (value: number) => {
            this.counter = value;
            resetCacheDataflow(this.dataflow, this.id);
            this.controls.count.setValue(value);
          },
        }),
      },
    ]);

    this.addOutputPort([
      { key: "exec", typeName: "exec", label: "Out" },
      { key: "count", typeName: "number", label: "Count" },
    ]);

    this.addControl(
      "count",
      new InputValueControl<number>({
        value: initial,
        type: "number",
        editable: false,
        history,
        area,
        onChange: () => resetCacheDataflow(this.dataflow, this.id),
      })
    );

    this.counter = initial;
  }

  data(): { count: number } {
    return { count: this.counter };
  }

  async execute(
    input: "exec" | "start" | "stop" | "reset" | "continue",
    forward: (output: "exec") => void
  ) {
    if (input === "reset") {
      const inputs = (await this.dataflow.fetchInputs(this.id, ["count"])) as {
        count: number;
      };
      const value = getInputValue(this.inputs, "count", inputs) || 0;
      this.counter = value;
      this.controls.count.setValue(value);
      resetCacheDataflow(this.dataflow, this.id);
      return;
    }

    if (input === "continue") {
      if (this.counter <= 0) {
        return;
      }
      this.counter -= 1;
      this.controls.count.setValue(this.counter);
      resetCacheDataflow(this.dataflow, this.id);
      forward("exec");
      return;
    }

    if (input === "stop") {
      this.counter = 0;
      this.controls.count.setValue(0);
      resetCacheDataflow(this.dataflow, this.id);
      return;
    }

    if (input === "start") {
      const inputs = (await this.dataflow.fetchInputs(this.id, ["count"])) as {
        count: number;
      };
      this.counter = getInputValue(this.inputs, "count", inputs) || 0;
      this.counter -= 1;
      forward("exec");
      return;
    }

    if (input === "exec") {
      if (this.counter <= 0) {
        this.counter = 0;
        this.controls.count.setValue(0);
        resetCacheDataflow(this.dataflow, this.id);
        return;
      }

      if (this.counter > 0) {
        this.counter -= 1;
        this.controls.count.setValue(this.counter);
        resetCacheDataflow(this.dataflow, this.id);
        forward("exec");
      }
    }
  }

  serializeControlValue(): { data: { value: number } } {
    const value = this.controls.count.getValue();
    return { data: { value } };
  }

  deserializeControlValue(data: { value: number }): void {
    this.controls.count.setValue(data.value);
    this.counter = data.value;
  }
}
