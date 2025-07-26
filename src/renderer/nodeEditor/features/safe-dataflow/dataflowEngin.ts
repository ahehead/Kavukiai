import {
  type GetSchemes,
  NodeEditor,
  type NodeId,
  type Root,
  Scope,
} from "rete";

import { type ClassicScheme, Dataflow } from "./dataflow";
import { Cache } from "./utils/cache";
import {
  type Cancellable,
  createCancellablePromise,
} from "./utils/cancellable";

export type DataflowNode = {
  data(
    inputs: Record<string, any>
  ): Promise<Record<string, any>> | Record<string, any>;
};
type Node = ClassicScheme["Node"] & DataflowNode;
export type DataflowEngineScheme = GetSchemes<
  Node,
  ClassicScheme["Connection"]
>;

type Configure<Schemes extends DataflowEngineScheme> = (
  node: Schemes["Node"]
) => {
  inputs: () => string[];
  outputs: () => string[];
};

/**
 * DataflowEngine is a plugin that integrates Dataflow with NodeEditor making it easy to use.
 * Additionally, it provides a cache for the data of each node in order to avoid recurring calculations.
 * @priority 10
 * @listens nodecreated
 * @listens noderemoved
 */
export class DataflowEngine<Schemes extends DataflowEngineScheme> extends Scope<
  never,
  [Root<Schemes>]
> {
  editor!: NodeEditor<Schemes>;
  dataflow?: Dataflow<Schemes>;
  cache = new Cache<NodeId, Cancellable<Record<string, any>>>((data) =>
    data?.cancel?.()
  );

  constructor(private configure?: Configure<Schemes>) {
    super("dataflow-engine");

    this.addPipe((context) => {
      if (context.type === "nodecreated") {
        this.add(context.data);
      }
      if (context.type === "noderemoved") {
        this.remove(context.data);
      }
      return context;
    });
  }

  setParent(scope: Scope<Root<Schemes>>): void {
    super.setParent(scope);

    this.editor = this.parentScope<NodeEditor<Schemes>>(NodeEditor);
    this.dataflow = new Dataflow(this.editor);
  }

  private getDataflow() {
    if (!this.dataflow)
      throw new Error(`DataflowEngine isn't attached to NodeEditor`);
    return this.dataflow;
  }

  private add(node: Schemes["Node"]) {
    const options = this.configure
      ? this.configure(node)
      : {
          inputs: () => Object.keys(node.inputs),
          outputs: () => Object.keys(node.outputs),
        };

    this.getDataflow().add(node, {
      inputs: options.inputs,
      outputs: options.outputs,
      data: async (fetchInputs) => {
        const cache = this.cache.get(node.id);

        if (cache) return cache;

        const cancellable = createCancellablePromise(
          () => fetchInputs, // prepare: Dataflow から渡された fetchInputs をそのまま次段へ
          async (fetch) => {
            if (this.hasDataWithFetch(node)) {
              // 新API: 必要なキーだけを取得できる
              return await node.dataWithFetch(fetch);
            }
            // 従来互換: 先に全部取ってから data を呼ぶ
            const inputs = await fetch();
            return await node.data(inputs);
          }
        );

        this.cache.add(node.id, cancellable);

        return cancellable;
      },
    });
  }

  private remove(node: Schemes["Node"]) {
    this.getDataflow().remove(node.id);
  }

  /**
   * Resets the cache of the node and all its predecessors.
   * @param nodeId Node id to reset. If not specified, all nodes will be reset.
   */
  public reset(nodeId?: NodeId, visited = new Set<NodeId>()) {
    if (!nodeId) {
      this.cache.clear();
      return;
    }

    if (visited.has(nodeId)) return; // ループ検知
    visited.add(nodeId);

    const setup = this.getDataflow().setups.get(nodeId);

    // setup がなければ静かに終了
    if (!setup) {
      this.cache.delete(nodeId);
      return;
    }

    const outputKeys = setup.outputs();

    this.cache.delete(nodeId);
    this.editor
      .getConnections()
      .filter((c) => c.source === nodeId && outputKeys.includes(c.sourceOutput))
      .forEach((c) => {
        this.reset(c.target, visited);
      });
  }

  /**
   * Fetches input data for the node by fetching data for all its predecessors recursively.
   * @param nodeId Node id to fetch input data for
   * @throws `Cancelled when `reset` is called while fetching data
   */
  public async fetchInputs<N extends Node>(
    node: NodeId | N
  ): Promise<Parameters<N["data"]>[0]>;
  public async fetchInputs<
    N extends Node,
    K extends keyof Parameters<N["data"]>[0]
  >(
    node: NodeId | N,
    keys: readonly K[]
  ): Promise<Pick<Parameters<N["data"]>[0], K>>;
  public async fetchInputs<
    N extends Node,
    K extends keyof Parameters<N["data"]>[0]
  >(node: NodeId | N, keys?: readonly K[]): Promise<any> {
    const id = typeof node === "object" ? node.id : node;

    return this.getDataflow().fetchInputs<Parameters<N["data"]>[0]>(
      new Set<NodeId>(),
      id,
      keys
    );
  }

  /**
   * Fetches output data of the node
   * @param nodeId Node id to fetch data from
   * @throws `Cancelled` when `reset` is called while fetching data
   */
  public async fetch<N extends Node>(
    node: NodeId | N
  ): Promise<ReturnType<N["data"]>> {
    const id = typeof node === "object" ? node.id : node;

    return this.getDataflow().fetch<ReturnType<N["data"]>>(
      id,
      new Set<NodeId>()
    );
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
    const inputs = (await this.fetchInputs(id, [inputKey])) as Record<
      string,
      T[] | undefined
    >;
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
    const inputs = (await this.fetchInputs(id, inputKeys)) as Record<
      string,
      unknown[]
    >;
    const result = inputKeys.map((key) => {
      const arr = inputs[key];
      return Array.isArray(arr) && arr.length > 0 ? arr[0] : null;
    });
    return result as any;
  }

  hasDataWithFetch(node: any): node is {
    dataWithFetch: (
      fetchInputs: <K extends string>(
        keys?: readonly K[]
      ) => Promise<Record<string, any>>
    ) => Promise<Record<string, any>> | Record<string, any>;
  } {
    return typeof node?.dataWithFetch === "function";
  }
}
