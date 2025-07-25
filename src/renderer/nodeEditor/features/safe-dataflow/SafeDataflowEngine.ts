import type { NodeEditor, NodeId, Scope } from "rete";
import { DataflowEngine, type DataflowEngineScheme } from "rete-engine";
import { type Node, SafeDataflow } from "./safeDataflow";

export class SafeDataflowEngine<
  S extends DataflowEngineScheme
> extends DataflowEngine<S> {
  override setParent(scope: Scope<any>): void {
    super.setParent(scope); // ここで this.editor が確定

    // ↓オリジナルは `new Dataflow(this.editor)` なので差し替える
    (this as any).dataflow = new SafeDataflow(this.editor as NodeEditor<S>);
  }

  override async fetchInputs<
    N extends Node,
    K extends keyof Parameters<N["data"]>[0] & string
  >(
    node: NodeId | N,
    keys?: readonly K[]
  ): Promise<Pick<Parameters<N["data"]>[0], K>> {
    const id = typeof node === "object" ? node.id : node;
    return (this as any).getDataflow().fetchInputs(id, keys);
  }
  /**
   * Fetch a single input value for the given node and key.
   * Returns the first value or null if not available.
   */
  async fetchInputSingle<T>(
    node: NodeId | Node,
    inputKey: string
  ): Promise<T | null> {
    const id = typeof node === "object" ? node.id : node;
    const inputs = (await (this as any)
      .getDataflow()
      .fetchInputs(id, [inputKey])) as Record<string, T[] | undefined>;
    const arr = inputs[inputKey];
    if (Array.isArray(arr) && arr.length > 0) {
      return arr[0];
    }
    return null;
  }

  /**
   * Fetch the first input value for each specified key.
   * Returns a tuple of values (or null) matching the order of inputKeys.
   */
  async fetchInputMultiple<
    N extends Node,
    Keys extends readonly (keyof Parameters<N["data"]>[0] & string)[]
  >(
    node: NodeId | N,
    inputKeys: Keys
  ): Promise<{
    [I in keyof Keys]: Keys[I] extends keyof Parameters<N["data"]>[0]
      ? Parameters<N["data"]>[0][Keys[I]] extends Array<infer U>
        ? U | null
        : null
      : null;
  }> {
    const id = typeof node === "object" ? node.id : node;
    const inputs = (await (this as any)
      .getDataflow()
      .fetchInputs(id, inputKeys)) as Record<string, unknown[]>;
    const result = inputKeys.map((key) => {
      const arr = inputs[key];
      return Array.isArray(arr) && arr.length > 0 ? arr[0] : null;
    });
    return result as any;
  }
}
