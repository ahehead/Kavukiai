// NOTE: このファイルは nodeFactories から型を逆算する方式へ移行するため
// 循環参照を避ける目的で Schemes.ts への依存を排除した。
// ここでは Rete 関連のジェネリクスは any で受け、利用側(Schemes)で再度型付けされる。
import type { NodeEditor } from "rete";
import type { AreaPlugin } from "rete-area-plugin";
import type { ControlFlowEngine } from "rete-engine";
import type { HistoryActions, HistoryPlugin } from "rete-history-plugin";
import type { DataflowEngine } from "../features/safe-dataflow/dataflowEngin";

// forward style placeholder types
type Schemes = any;
type AreaExtra = any;

import {
  BoolNode,
  CodeFenceNode,
  ComfyDesktopStartNode,
  ComfyUIFreeMemoryNode,
  ComfyUINode,
  CounterLoopNode,
  CreateSelectNode,
  GetModelInfoListNode,
  InspectorNode,
  JoinNode,
  JsonFilePathNode,
  JsonSchemaFormatNode,
  JsonSchemaNode,
  JsonSchemaToObjectNode,
  ListDownloadedModelsNode,
  LLMPredictionConfigNode,
  LMStudioChatNode,
  LMStudioLoadModelNode,
  LMStudioStartNode,
  LMStudioStopNode,
  LoadWorkflowFileNode,
  MergeWorkflowInputsDefaultsNode,
  ModelInfoToModelListNode,
  MultiLineStringNode,
  NumberNode,
  NumberToStringNode,
  ObjectPickNode,
  ObjectToStringNode,
  ObjectToYAMLStringNode,
  OpenAINode,
  PrepareWorkflowPromptNode,
  ResponseCreateParamsBaseNode,
  ResponseTextConfigNode,
  RunNode,
  SelectImageNode,
  ServerStatusNode,
  ShowImageNode,
  StringFormNode,
  StringNode,
  TemplateReplaceNode,
  TemplateWorkflowListNode,
  TestNode,
  UChatMessageByStringNode,
  UChatNode,
  UnknownNode,
  UnLoadModelNode,
  UserWorkflowListNode,
  WorkflowInputsNode,
  WorkflowOutputsNode,
} from "./Node";
import { OpenAIToUChatCommandNode } from "./Node/Chat/OpenAIToUChatCommandNode";
import { ReverseRoleNode } from "./Node/Chat/ReverseRoleNode";
import { UChatGetLastMessageNode } from "./Node/Chat/UChatGetLastMessageNode";
import { UChatMessageNode } from "./Node/Chat/UChatMessageNode";
import { UChatRoleNode } from "./Node/Chat/UChatRoleNode";
import { UChatToLMStudioNode } from "./Node/Chat/UChatToLMStudioNode";
import { UChatToOpenAINode } from "./Node/Chat/UChatToOpenAINode";
import { UChatToStringNode } from "./Node/Chat/UChatToStringNode";
import { UPartTextNode } from "./Node/Chat/UPartTextNode";
import { ArrayNode } from "./Node/Primitive/ArrayNode";
import { IFNode } from "./Node/Primitive/Flow/IFNode";

export type NodeDeps = {
  editor: NodeEditor<Schemes>;
  area: AreaPlugin<Schemes, AreaExtra>;
  dataflow: DataflowEngine<Schemes>;
  controlflow: ControlFlowEngine<Schemes>;
  history: HistoryPlugin<Schemes, HistoryActions<Schemes>>;
  message?: string;
};
// ===== Factory + Meta 定義 =====================================
// カテゴリ & サブカテゴリ情報を meta に付与し、メニュー構築を自動化する。
export interface FactoryMeta {
  category: string; // 第一階層 (例: "Primitive", "UChat")
  subcategory?: string; // 第二階層 (例: "String", "Flow")
  label?: string; // 表示名。指定なければ factory key
  devOnly?: boolean; // development のみ表示
}

type AnyNodeInstance = { label: string };
type NodeFactory<N extends AnyNodeInstance = AnyNodeInstance> = (
  deps: NodeDeps
) => N;
export type FactoryWithMeta<N extends AnyNodeInstance = AnyNodeInstance> =
  NodeFactory<N> & {
    meta: FactoryMeta;
  };

function define<N extends AnyNodeInstance>(
  fn: (deps: NodeDeps) => N,
  meta: FactoryMeta
): FactoryWithMeta<N> {
  (fn as any).meta = meta;
  return fn as FactoryWithMeta<N>;
}

// nodeFactories 本体
export const nodeFactories = {
  // Primitive / String
  Unknown: define(
    ({ message }: NodeDeps): UnknownNode => new UnknownNode(message),
    {
      category: "Debug",
      devOnly: true,
    }
  ),
  Test: define((_: NodeDeps): TestNode => new TestNode(), {
    category: "Debug",
    devOnly: true,
  }),
  Inspector: define(
    ({ dataflow, area, controlflow }: NodeDeps): InspectorNode =>
      new InspectorNode(dataflow, area, controlflow),
    { category: "Inspector" }
  ),

  String: define(
    ({ history, area, dataflow }: NodeDeps): StringNode =>
      new StringNode("", history, area, dataflow),
    { category: "Primitive", subcategory: "String" }
  ),
  MultiLineString: define(
    ({ history, area, dataflow }: NodeDeps): MultiLineStringNode =>
      new MultiLineStringNode("", history, area, dataflow),
    { category: "Primitive", subcategory: "String" }
  ),
  TemplateReplace: define(
    ({ dataflow, controlflow }: NodeDeps): TemplateReplaceNode =>
      new TemplateReplaceNode(dataflow, controlflow),
    { category: "Primitive", subcategory: "String" }
  ),
  JsonFilePath: define(
    ({ history, area, dataflow }: NodeDeps): JsonFilePathNode =>
      new JsonFilePathNode("", history, area, dataflow),
    { category: "Primitive", subcategory: "String" }
  ),
  StringForm: define(
    ({ history, area, dataflow, controlflow }: NodeDeps): StringFormNode =>
      new StringFormNode("", history, area, dataflow, controlflow),
    { category: "Primitive", subcategory: "String" }
  ),
  Join: define(({ dataflow }: NodeDeps): JoinNode => new JoinNode(dataflow), {
    category: "Primitive",
    subcategory: "String",
  }),
  NumberToString: define(
    (_: NodeDeps): NumberToStringNode => new NumberToStringNode(),
    {
      category: "Primitive",
      subcategory: "String",
    }
  ),
  ObjectToString: define(
    (_: NodeDeps): ObjectToStringNode => new ObjectToStringNode(),
    {
      category: "Primitive",
      subcategory: "String",
    }
  ),
  ObjectToYAMLString: define(
    (_: NodeDeps): ObjectToYAMLStringNode => new ObjectToYAMLStringNode(),
    {
      category: "Primitive",
      subcategory: "String",
    }
  ),
  CodeFence: define(
    ({ dataflow }: NodeDeps): CodeFenceNode => new CodeFenceNode(dataflow),
    {
      category: "Primitive",
      subcategory: "String",
    }
  ),

  Number: define(
    ({ history, area, dataflow }: NodeDeps): NumberNode =>
      new NumberNode(0, history, area, dataflow),
    { category: "Primitive" }
  ),
  Bool: define(
    ({ history, area, dataflow }: NodeDeps): BoolNode =>
      new BoolNode(history, area, dataflow),
    { category: "Primitive" }
  ),

  Array: define(
    ({ area, dataflow }: NodeDeps): ArrayNode => new ArrayNode(area, dataflow),
    {
      category: "Primitive",
    }
  ),
  CreateSelect: define(
    ({ dataflow, controlflow }: NodeDeps): CreateSelectNode =>
      new CreateSelectNode(dataflow, controlflow),
    { category: "Primitive" }
  ),
  SelectImage: define(
    ({ history, area, dataflow }: NodeDeps): SelectImageNode =>
      new SelectImageNode(history, area, dataflow),
    { category: "Primitive", subcategory: "Image" }
  ),
  ShowImage: define(
    ({ area, dataflow, controlflow }: NodeDeps): ShowImageNode =>
      new ShowImageNode(area, dataflow, controlflow),
    { category: "Primitive", subcategory: "Image" }
  ),

  // lmstudio nodes
  ListDownloadedModels: define(
    ({ dataflow, controlflow }: NodeDeps): ListDownloadedModelsNode =>
      new ListDownloadedModelsNode(dataflow, controlflow),
    { category: "LMStudio" }
  ),
  GetModelInfoList: define(
    ({ dataflow, controlflow }: NodeDeps): GetModelInfoListNode =>
      new GetModelInfoListNode(dataflow, controlflow),
    { category: "LMStudio" }
  ),
  ModelInfoToModelList: define(
    (_: NodeDeps): ModelInfoToModelListNode => new ModelInfoToModelListNode(),
    { category: "LMStudio" }
  ),
  LMStudioChat: define(
    ({ area, dataflow, controlflow }: NodeDeps): LMStudioChatNode =>
      new LMStudioChatNode(area, dataflow, controlflow),
    { category: "LMStudio" }
  ),
  LMStudioStart: define(
    ({ controlflow }: NodeDeps): LMStudioStartNode =>
      new LMStudioStartNode(controlflow),
    { category: "LMStudio" }
  ),
  LMStudioStop: define(
    ({ controlflow }: NodeDeps): LMStudioStopNode =>
      new LMStudioStopNode(controlflow),
    { category: "LMStudio" }
  ),
  LMStudioLoadModel: define(
    ({ area, dataflow, controlflow }: NodeDeps): LMStudioLoadModelNode =>
      new LMStudioLoadModelNode(area, dataflow, controlflow),
    { category: "LMStudio" }
  ),
  ServerStatus: define(
    ({ dataflow, controlflow }: NodeDeps): ServerStatusNode =>
      new ServerStatusNode(dataflow, controlflow),
    { category: "LMStudio" }
  ),
  UnLoadModel: define(
    ({ controlflow }: NodeDeps): UnLoadModelNode =>
      new UnLoadModelNode(controlflow),
    { category: "LMStudio" }
  ),
  LLMPredictionConfig: define(
    ({ dataflow }: NodeDeps): LLMPredictionConfigNode =>
      new LLMPredictionConfigNode(dataflow),
    { category: "LMStudio" }
  ),

  // ComfyUI
  ComfyUI: define(
    ({ area, dataflow, controlflow }: NodeDeps): ComfyUINode =>
      new ComfyUINode(area, dataflow, controlflow),
    { category: "ComfyUI" }
  ),
  ComfyDesktopStart: define(
    ({ area, dataflow, controlflow }: NodeDeps): ComfyDesktopStartNode =>
      new ComfyDesktopStartNode(area, dataflow, controlflow),
    { category: "ComfyUI" }
  ),
  ComfyUIFreeMemory: define(
    ({
      area,
      history,
      dataflow,
      controlflow,
    }: NodeDeps): ComfyUIFreeMemoryNode =>
      new ComfyUIFreeMemoryNode(area, history, dataflow, controlflow),
    { category: "ComfyUI" }
  ),
  PrepareWorkflowPrompt: define(
    ({
      area,
      history,
      dataflow,
      controlflow,
    }: NodeDeps): PrepareWorkflowPromptNode =>
      new PrepareWorkflowPromptNode(area, history, dataflow, controlflow),
    { category: "ComfyUI" }
  ),
  LoadWorkflowFile: define(
    ({ area, dataflow, controlflow }: NodeDeps): LoadWorkflowFileNode =>
      new LoadWorkflowFileNode(area, dataflow, controlflow),
    { category: "ComfyUI" }
  ),
  TemplateWorkflowList: define(
    ({
      area,
      history,
      dataflow,
      controlflow,
    }: NodeDeps): TemplateWorkflowListNode =>
      new TemplateWorkflowListNode(area, history, dataflow, controlflow),
    { category: "ComfyUI" }
  ),
  UserWorkflowList: define(
    ({ history, dataflow, controlflow }: NodeDeps): UserWorkflowListNode =>
      new UserWorkflowListNode(history, dataflow, controlflow),
    { category: "ComfyUI" }
  ),
  WorkflowInputs: define(
    ({ history, area, dataflow, controlflow }: NodeDeps): WorkflowInputsNode =>
      new WorkflowInputsNode(history, area, dataflow, controlflow),
    { category: "ComfyUI" }
  ),
  WorkflowOutputs: define(
    ({ history, area, dataflow, controlflow }: NodeDeps): WorkflowOutputsNode =>
      new WorkflowOutputsNode(history, area, dataflow, controlflow),
    { category: "ComfyUI" }
  ),
  MergeWorkflowInputsDefaults: define(
    (_: NodeDeps): MergeWorkflowInputsDefaultsNode =>
      new MergeWorkflowInputsDefaultsNode(),
    { category: "ComfyUI" }
  ),

  // OpenAI nodes
  OpenAI: define(
    ({ area, dataflow, controlflow }: NodeDeps): OpenAINode =>
      new OpenAINode(area, dataflow, controlflow),
    { category: "OpenAI" }
  ),
  ResponseCreateParamsBase: define(
    ({ history, area, dataflow }: NodeDeps): ResponseCreateParamsBaseNode =>
      new ResponseCreateParamsBaseNode(history, area, dataflow),
    { category: "OpenAI" }
  ),
  JsonSchemaFormat: define(
    ({ history, area, dataflow }: NodeDeps): JsonSchemaFormatNode =>
      new JsonSchemaFormatNode(history, area, dataflow),
    { category: "OpenAI" }
  ),
  ResponseTextConfig: define(
    (_: NodeDeps): ResponseTextConfigNode => new ResponseTextConfigNode(),
    {
      category: "OpenAI",
    }
  ),

  // chat / UChat
  UChatToString: define(
    (_: NodeDeps): UChatToStringNode => new UChatToStringNode(),
    {
      category: "UChat",
    }
  ),
  UChatGetLastMessage: define(
    (_: NodeDeps): UChatGetLastMessageNode => new UChatGetLastMessageNode(),
    {
      category: "UChat",
    }
  ),
  OpenAIToUChatCommand: define(
    (_: NodeDeps): OpenAIToUChatCommandNode => new OpenAIToUChatCommandNode(),
    {
      category: "UChat",
    }
  ),
  UChatMessage: define(
    (_: NodeDeps): UChatMessageNode => new UChatMessageNode(),
    { category: "UChat" }
  ),
  UChatMessageByString: define(
    (_: NodeDeps) => new UChatMessageByStringNode(),
    {
      category: "UChat",
    }
  ),
  UPartText: define(
    ({ history, area, dataflow }: NodeDeps): UPartTextNode =>
      new UPartTextNode("", history, area, dataflow),
    { category: "UChat" }
  ),
  UChatToOpenAI: define(
    (_: NodeDeps): UChatToOpenAINode => new UChatToOpenAINode(),
    { category: "UChat" }
  ),
  UChatToLMStudio: define(
    (_: NodeDeps): UChatToLMStudioNode => new UChatToLMStudioNode(),
    {
      category: "UChat",
    }
  ),
  UChat: define(
    ({ history, area, dataflow, controlflow }: NodeDeps): UChatNode =>
      new UChatNode([], history, area, dataflow, controlflow),
    { category: "UChat" }
  ),
  UChatRole: define(
    ({ history, area, dataflow }: NodeDeps): UChatRoleNode =>
      new UChatRoleNode("user", history, area, dataflow),
    { category: "UChat" }
  ),
  ReverseRole: define((_: NodeDeps): ReverseRoleNode => new ReverseRoleNode(), {
    category: "UChat",
  }),

  ObjectPick: define(
    ({ area, dataflow }: NodeDeps): ObjectPickNode =>
      new ObjectPickNode(area, dataflow),
    {
      category: "Primitive",
      subcategory: "Object",
    }
  ),
  JsonSchemaToObject: define(
    ({
      editor,
      history,
      area,
      dataflow,
      controlflow,
    }: NodeDeps): JsonSchemaToObjectNode =>
      new JsonSchemaToObjectNode(editor, history, area, dataflow, controlflow),
    { category: "Primitive", subcategory: "Object" }
  ),
  JsonSchema: define(
    ({ history, area, dataflow }: NodeDeps): JsonSchemaNode =>
      new JsonSchemaNode(history, area, dataflow),
    { category: "Primitive", subcategory: "Object" }
  ),

  // flow
  IF: define(
    ({ history, area, dataflow }: NodeDeps): IFNode =>
      new IFNode(history, area, dataflow),
    { category: "Primitive", subcategory: "Flow" }
  ),
  Run: define(
    ({ controlflow }: NodeDeps): RunNode => new RunNode(controlflow),
    {
      category: "Primitive",
      subcategory: "Flow",
    }
  ),
  CounterLoop: define(
    ({ history, area, dataflow, controlflow }: NodeDeps): CounterLoopNode =>
      new CounterLoopNode(1, history, area, dataflow, controlflow),
    { category: "Primitive", subcategory: "Flow" }
  ),
} as const satisfies Record<string, FactoryWithMeta>;

// nodeFactories から型を抽出して Schemes.ts 側で利用するための補助型
export type NodeFactoriesType = typeof nodeFactories;

// ===== メニュー生成 =============================================
export interface MenuItemDefinition {
  label: string;
  key: string;
  handler?: () => void;
  factoryKey?: string;
  subitems?: MenuItemDefinition[];
}

const generateKey = (label: string): string =>
  label.toLowerCase().replace(/\s+/g, "-");

interface CategoryMapNode {
  items: { label: string; factoryKey: string }[];
  subcats: Map<string, CategoryMapNode>;
}

function buildMenuFromMeta(): MenuItemDefinition[] {
  const categoryMap = new Map<string, CategoryMapNode>();
  for (const [factoryKey, fn] of Object.entries(nodeFactories)) {
    const meta = (fn as FactoryWithMeta).meta;
    if (!meta) continue;
    if (meta.devOnly && process.env.NODE_ENV !== "development") continue;
    const category = meta.category;
    const sub = meta.subcategory;
    let catNode = categoryMap.get(category);
    if (!catNode) {
      catNode = { items: [], subcats: new Map() };
      categoryMap.set(category, catNode);
    }
    if (sub) {
      let subNode = catNode.subcats.get(sub);
      if (!subNode) {
        subNode = { items: [], subcats: new Map() };
        catNode.subcats.set(sub, subNode);
      }
      subNode.items.push({ label: meta.label ?? factoryKey, factoryKey });
    } else {
      catNode.items.push({ label: meta.label ?? factoryKey, factoryKey });
    }
  }

  // Build hierarchical structure
  const menu: MenuItemDefinition[] = [];
  for (const [category, catNode] of categoryMap.entries()) {
    const subitems: MenuItemDefinition[] = [];
    // subcategories first
    for (const [sub, subNode] of catNode.subcats.entries()) {
      subitems.push({
        label: sub,
        key: generateKey(sub),
        subitems: subNode.items
          .sort((a, b) => a.label.localeCompare(b.label))
          .map((i) => ({
            label: i.label,
            key: generateKey(`${category}-${sub}-${i.label}`),
            factoryKey: i.factoryKey,
          })),
      });
    }
    // direct items
    for (const item of catNode.items.sort((a, b) =>
      a.label.localeCompare(b.label)
    )) {
      subitems.push({
        label: item.label,
        key: generateKey(`${category}-${item.label}`),
        factoryKey: item.factoryKey,
      });
    }

    menu.push({
      label: category,
      key: generateKey(category),
      subitems: subitems.length ? subitems : undefined,
      factoryKey: subitems.length ? undefined : undefined,
    });
  }

  // 並び順: 既存 UX に近いように手動ソート優先順リスト
  const order = [
    "Primitive",
    "UChat",
    "Inspector",
    "LMStudio",
    "OpenAI",
    "ComfyUI",
    "Debug",
  ];
  menu.sort((a, b) => {
    const ia = order.indexOf(a.label);
    const ib = order.indexOf(b.label);
    return (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib);
  });
  return menu;
}

export const contextMenuStructure = buildMenuFromMeta();

// ===== 開発時アサーション ========================================
if (import.meta.env?.DEV) {
  try {
    for (const [key, factory] of Object.entries(nodeFactories)) {
      // 一部重いノードを避けたい場合はスキップ条件をここで追加可能
      const meta = (factory as any).meta as FactoryMeta | undefined;
      if (!meta) continue;
      // deps を最小限ダミーで供給 (コンストラクタが未使用の引数には undefined が入る)
      const dummy: any = {
        editor: undefined,
        area: undefined,
        dataflow: {
          /* minimal stub */
        } as any,
        controlflow: undefined,
        history: undefined,
      };
      let instanceLabel: string | undefined;
      try {
        const instance = (factory as any)(dummy);
        instanceLabel = instance?.label;
      } catch {
        // 生成失敗はラベル検証だけなので握りつぶし
      }
      if (instanceLabel && instanceLabel !== key) {
        // eslint-disable-next-line no-console
        console.warn(
          `[nodeFactories] key '${key}' とインスタンス label '${instanceLabel}' 不一致`
        );
      }
    }
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn("nodeFactories dev assertion failed", e);
  }
}
