import type { NodeEditor, NodeId, Scope } from "rete";
import {
  Dataflow,
  DataflowEngine,
  type DataflowEngineScheme,
} from "rete-engine";
import type { ClassicScheme } from "rete-engine/_types/types";

type DefaultInputs = null;
type Inputs = Partial<Record<string, any[]>> | DefaultInputs;
type FetchInputs<T> = T extends DefaultInputs
  ? Record<string, any>
  : Partial<T>;

export class SafeDataflow<S extends ClassicScheme> extends Dataflow<S> {
  // --------------- ① 入口 ---------------
  public fetch<T extends Record<string, any>>(nodeId: NodeId): Promise<T> {
    return this._fetch(nodeId, new Set<NodeId>());
  }

  // --------------- ② fetchInputs ---------------
  public fetchInputs<T extends Inputs = DefaultInputs>(
    nodeId: NodeId
  ): Promise<FetchInputs<T>> {
    return this._fetchInputs(nodeId, new Set<NodeId>());
  }

  // --------------- ③ 再帰本体 (private) ---------------
  private async _fetch<T>(nodeId: NodeId, path: Set<NodeId>): Promise<T> {
    if (path.has(nodeId)) {
      // ループ検知：好みに合わせて throw でも OK
      return {} as T;
    }
    path.add(nodeId);

    const setup = this.setups.get(nodeId);
    if (!setup) throw new Error("node is not initialized");

    // ---- Dataflow.fetch() のロジックを丸ごと再掲 ----
    const outputKeys = setup.outputs();
    const data = await setup.data(() => this._fetchInputs(nodeId, path));

    const returningKeys = Object.keys(data) as (string | number | symbol)[];
    if (!outputKeys.every((k) => returningKeys.includes(k))) {
      throw new Error(
        `dataflow node "${nodeId}" doesn't return all of required properties. ` +
          `Expected "${outputKeys.join('", "')}". Got "${returningKeys.join(
            '", "'
          )}"`
      );
    }
    return data as T;
  }

  private async _fetchInputs<T extends Inputs = DefaultInputs>(
    nodeId: NodeId,
    path: Set<NodeId>
  ): Promise<FetchInputs<T>> {
    const setup = this.setups.get(nodeId);
    if (!setup) throw new Error("node is not initialized");

    const inputKeys = setup.inputs();
    // access private editor via any and treat connections as any for simplicity
    const cons = (this as any).editor
      .getConnections()
      .filter(
        (c: any) => c.target === nodeId && inputKeys.includes(c.targetInput)
      );

    const inputs = {} as FetchInputs<T>;
    for (const c of cons) {
      // cast sourceData to any to avoid unknown type issues
      const sourceData = (await this._fetch(c.source, path)) as any;
      const prev = (inputs[c.targetInput] ?? []) as any[];
      (inputs as Record<string, any[]>)[c.targetInput] = [
        ...prev,
        sourceData[c.sourceOutput],
      ];
    }
    return inputs;
  }
}

export class SafeDataflowEngine<
  S extends DataflowEngineScheme
> extends DataflowEngine<S> {
  override setParent(scope: Scope<any>): void {
    super.setParent(scope); // ここで this.editor が確定
    // ↓オリジナルは `new Dataflow(this.editor)` なので差し替える
    (this as any).dataflow = new SafeDataflow(this.editor as NodeEditor<S>);
  }
}
