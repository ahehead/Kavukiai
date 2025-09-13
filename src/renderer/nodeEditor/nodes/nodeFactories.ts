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
  namespace?: string; // 省略時は "core"
  id?: string; // 明示ID（省略時は `${namespace}:${factoryKey}` を自動付与）
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
  const wrapped = ((deps: NodeDeps) => {
    const node = fn(deps) as any;
    // ensure typeId is assigned from meta.id after registry normalization
    const m = (wrapped as any).meta as FactoryMeta | undefined;
    if (m?.id && !node.typeId) node.typeId = m.id;
    return node as N;
  }) as any;
  (wrapped as any).meta = meta;
  return wrapped as FactoryWithMeta<N>;
}

// nodeFactories 本体
export const nodeFactories = {
  // Primitive / String
  Unknown: define(
    ({ message }: NodeDeps): UnknownNode => new UnknownNode(message),
    {
      category: "Debug",
      namespace: "Debug",
      label: "Unknown",
      devOnly: true,
    }
  ),
  Test: define((_: NodeDeps): TestNode => new TestNode(), {
    category: "Debug",
    namespace: "Debug",
    label: "Test",
    devOnly: true,
  }),
  Inspector: define(
    ({ dataflow, area, controlflow }: NodeDeps): InspectorNode =>
      new InspectorNode(dataflow, area, controlflow),
    { category: "Inspector", namespace: "Inspector", label: "Inspector" }
  ),

  String: define(
    ({ history, area, dataflow }: NodeDeps): StringNode =>
      new StringNode("", history, area, dataflow),
    {
      category: "Primitive",
      namespace: "Primitive",
      subcategory: "String",
      label: "String",
    }
  ),
  MultiLineString: define(
    ({ history, area, dataflow }: NodeDeps): MultiLineStringNode =>
      new MultiLineStringNode("", history, area, dataflow),
    {
      category: "Primitive",
      namespace: "Primitive",
      subcategory: "String",
      label: "MultiLineString",
    }
  ),
  TemplateReplace: define(
    ({ dataflow, controlflow }: NodeDeps): TemplateReplaceNode =>
      new TemplateReplaceNode(dataflow, controlflow),
    {
      category: "Primitive",
      namespace: "Primitive",
      subcategory: "String",
      label: "TemplateReplace",
    }
  ),
  JsonFilePath: define(
    ({ history, area, dataflow }: NodeDeps): JsonFilePathNode =>
      new JsonFilePathNode("", history, area, dataflow),
    {
      category: "Primitive",
      namespace: "Primitive",
      subcategory: "String",
      label: "JsonFilePath",
    }
  ),
  StringForm: define(
    ({ history, area, dataflow, controlflow }: NodeDeps): StringFormNode =>
      new StringFormNode("", history, area, dataflow, controlflow),
    {
      category: "Primitive",
      namespace: "Primitive",
      subcategory: "String",
      label: "StringForm",
    }
  ),
  Join: define(({ dataflow }: NodeDeps): JoinNode => new JoinNode(dataflow), {
    category: "Primitive",
    namespace: "Primitive",
    subcategory: "String",
    label: "Join",
  }),
  NumberToString: define(
    (_: NodeDeps): NumberToStringNode => new NumberToStringNode(),
    {
      category: "Primitive",
      namespace: "Primitive",
      subcategory: "String",
      label: "NumberToString",
    }
  ),
  ObjectToString: define(
    (_: NodeDeps): ObjectToStringNode => new ObjectToStringNode(),
    {
      category: "Primitive",
      namespace: "Primitive",
      subcategory: "String",
      label: "ObjectToString",
    }
  ),
  ObjectToYAMLString: define(
    (_: NodeDeps): ObjectToYAMLStringNode => new ObjectToYAMLStringNode(),
    {
      category: "Primitive",
      namespace: "Primitive",
      subcategory: "String",
      label: "ObjectToYAMLString",
    }
  ),
  CodeFence: define(
    ({ dataflow }: NodeDeps): CodeFenceNode => new CodeFenceNode(dataflow),
    {
      category: "Primitive",
      namespace: "Primitive",
      subcategory: "String",
      label: "CodeFence",
    }
  ),

  Number: define(
    ({ history, area, dataflow }: NodeDeps): NumberNode =>
      new NumberNode(0, history, area, dataflow),
    { category: "Primitive", namespace: "Primitive", label: "Number" }
  ),
  Bool: define(
    ({ history, area, dataflow }: NodeDeps): BoolNode =>
      new BoolNode(history, area, dataflow),
    { category: "Primitive", namespace: "Primitive", label: "Bool" }
  ),

  Array: define(
    ({ area, dataflow }: NodeDeps): ArrayNode => new ArrayNode(area, dataflow),
    {
      category: "Primitive",
      namespace: "Primitive",
      label: "Array",
    }
  ),
  CreateSelect: define(
    ({ dataflow, controlflow }: NodeDeps): CreateSelectNode =>
      new CreateSelectNode(dataflow, controlflow),
    { category: "Primitive", namespace: "Primitive", label: "CreateSelect" }
  ),
  SelectImage: define(
    ({ history, area, dataflow }: NodeDeps): SelectImageNode =>
      new SelectImageNode(history, area, dataflow),
    {
      category: "Primitive",
      namespace: "Primitive",
      subcategory: "Image",
      label: "SelectImage",
    }
  ),
  ShowImage: define(
    ({ area, dataflow, controlflow }: NodeDeps): ShowImageNode =>
      new ShowImageNode(area, dataflow, controlflow),
    {
      category: "Primitive",
      namespace: "Primitive",
      subcategory: "Image",
      label: "ShowImage",
    }
  ),

  // lmstudio nodes
  ListDownloadedModels: define(
    ({ dataflow, controlflow }: NodeDeps): ListDownloadedModelsNode =>
      new ListDownloadedModelsNode(dataflow, controlflow),
    {
      category: "LMStudio",
      namespace: "LMStudio",
      label: "ListDownloadedModels",
    }
  ),
  GetModelInfoList: define(
    ({ dataflow, controlflow }: NodeDeps): GetModelInfoListNode =>
      new GetModelInfoListNode(dataflow, controlflow),
    { category: "LMStudio", namespace: "LMStudio", label: "GetModelInfoList" }
  ),
  ModelInfoToModelList: define(
    (_: NodeDeps): ModelInfoToModelListNode => new ModelInfoToModelListNode(),
    {
      category: "LMStudio",
      namespace: "LMStudio",
      label: "ModelInfoToModelList",
    }
  ),
  LMStudioChat: define(
    ({ area, dataflow, controlflow }: NodeDeps): LMStudioChatNode =>
      new LMStudioChatNode(area, dataflow, controlflow),
    { category: "LMStudio", namespace: "LMStudio", label: "LMStudioChat" }
  ),
  LMStudioStart: define(
    ({ controlflow }: NodeDeps): LMStudioStartNode =>
      new LMStudioStartNode(controlflow),
    { category: "LMStudio", namespace: "LMStudio", label: "LMStudioStart" }
  ),
  LMStudioStop: define(
    ({ controlflow }: NodeDeps): LMStudioStopNode =>
      new LMStudioStopNode(controlflow),
    { category: "LMStudio", namespace: "LMStudio", label: "LMStudioStop" }
  ),
  LMStudioLoadModel: define(
    ({ area, dataflow, controlflow }: NodeDeps): LMStudioLoadModelNode =>
      new LMStudioLoadModelNode(area, dataflow, controlflow),
    { category: "LMStudio", namespace: "LMStudio", label: "LMStudioLoadModel" }
  ),
  ServerStatus: define(
    ({ dataflow, controlflow }: NodeDeps): ServerStatusNode =>
      new ServerStatusNode(dataflow, controlflow),
    { category: "LMStudio", namespace: "LMStudio", label: "ServerStatus" }
  ),
  UnLoadModel: define(
    ({ controlflow }: NodeDeps): UnLoadModelNode =>
      new UnLoadModelNode(controlflow),
    { category: "LMStudio", namespace: "LMStudio", label: "UnLoadModel" }
  ),
  LLMPredictionConfig: define(
    ({ dataflow }: NodeDeps): LLMPredictionConfigNode =>
      new LLMPredictionConfigNode(dataflow),
    {
      category: "LMStudio",
      namespace: "LMStudio",
      label: "LLMPredictionConfig",
    }
  ),

  // ComfyUI
  ComfyUI: define(
    ({ area, dataflow, controlflow }: NodeDeps): ComfyUINode =>
      new ComfyUINode(area, dataflow, controlflow),
    { category: "ComfyUI", namespace: "ComfyUI", label: "ComfyUI" }
  ),
  ComfyDesktopStart: define(
    ({ area, dataflow, controlflow }: NodeDeps): ComfyDesktopStartNode =>
      new ComfyDesktopStartNode(area, dataflow, controlflow),
    { category: "ComfyUI", namespace: "ComfyUI", label: "ComfyDesktopStart" }
  ),
  ComfyUIFreeMemory: define(
    ({
      area,
      history,
      dataflow,
      controlflow,
    }: NodeDeps): ComfyUIFreeMemoryNode =>
      new ComfyUIFreeMemoryNode(area, history, dataflow, controlflow),
    { category: "ComfyUI", namespace: "ComfyUI", label: "ComfyUIFreeMemory" }
  ),
  PrepareWorkflowPrompt: define(
    ({
      area,
      history,
      dataflow,
      controlflow,
    }: NodeDeps): PrepareWorkflowPromptNode =>
      new PrepareWorkflowPromptNode(area, history, dataflow, controlflow),
    {
      category: "ComfyUI",
      namespace: "ComfyUI",
      label: "PrepareWorkflowPrompt",
    }
  ),
  LoadWorkflowFile: define(
    ({ area, dataflow, controlflow }: NodeDeps): LoadWorkflowFileNode =>
      new LoadWorkflowFileNode(area, dataflow, controlflow),
    { category: "ComfyUI", namespace: "ComfyUI", label: "LoadWorkflowFile" }
  ),
  TemplateWorkflowList: define(
    ({
      area,
      history,
      dataflow,
      controlflow,
    }: NodeDeps): TemplateWorkflowListNode =>
      new TemplateWorkflowListNode(area, history, dataflow, controlflow),
    { category: "ComfyUI", namespace: "ComfyUI", label: "TemplateWorkflowList" }
  ),
  UserWorkflowList: define(
    ({ history, dataflow, controlflow }: NodeDeps): UserWorkflowListNode =>
      new UserWorkflowListNode(history, dataflow, controlflow),
    { category: "ComfyUI", namespace: "ComfyUI", label: "UserWorkflowList" }
  ),
  WorkflowInputs: define(
    ({ history, area, dataflow, controlflow }: NodeDeps): WorkflowInputsNode =>
      new WorkflowInputsNode(history, area, dataflow, controlflow),
    { category: "ComfyUI", namespace: "ComfyUI", label: "WorkflowInputs" }
  ),
  WorkflowOutputs: define(
    ({ history, area, dataflow, controlflow }: NodeDeps): WorkflowOutputsNode =>
      new WorkflowOutputsNode(history, area, dataflow, controlflow),
    { category: "ComfyUI", namespace: "ComfyUI", label: "WorkflowOutputs" }
  ),
  MergeWorkflowInputsDefaults: define(
    (_: NodeDeps): MergeWorkflowInputsDefaultsNode =>
      new MergeWorkflowInputsDefaultsNode(),
    {
      category: "ComfyUI",
      namespace: "ComfyUI",
      label: "MergeWorkflowInputsDefaults",
    }
  ),

  // OpenAI nodes
  OpenAI: define(
    ({ area, dataflow, controlflow }: NodeDeps): OpenAINode =>
      new OpenAINode(area, dataflow, controlflow),
    { category: "OpenAI", namespace: "OpenAI", label: "OpenAI" }
  ),
  ResponseCreateParamsBase: define(
    ({ history, area, dataflow }: NodeDeps): ResponseCreateParamsBaseNode =>
      new ResponseCreateParamsBaseNode(history, area, dataflow),
    {
      category: "OpenAI",
      namespace: "OpenAI",
      label: "ResponseCreateParamsBase",
    }
  ),
  JsonSchemaFormat: define(
    ({ history, area, dataflow }: NodeDeps): JsonSchemaFormatNode =>
      new JsonSchemaFormatNode(history, area, dataflow),
    { category: "OpenAI", namespace: "OpenAI", label: "JsonSchemaFormat" }
  ),
  ResponseTextConfig: define(
    (_: NodeDeps): ResponseTextConfigNode => new ResponseTextConfigNode(),
    {
      category: "OpenAI",
      namespace: "OpenAI",
      label: "ResponseTextConfig",
    }
  ),

  // chat / UChat
  UChatToString: define(
    (_: NodeDeps): UChatToStringNode => new UChatToStringNode(),
    {
      category: "UChat",
      namespace: "UChat",
      label: "UChatToString",
    }
  ),
  UChatGetLastMessage: define(
    (_: NodeDeps): UChatGetLastMessageNode => new UChatGetLastMessageNode(),
    {
      category: "UChat",
      namespace: "UChat",
      label: "UChatGetLastMessage",
    }
  ),
  OpenAIToUChatCommand: define(
    (_: NodeDeps): OpenAIToUChatCommandNode => new OpenAIToUChatCommandNode(),
    {
      category: "UChat",
      namespace: "UChat",
      label: "OpenAIToUChatCommand",
    }
  ),
  UChatMessage: define(
    (_: NodeDeps): UChatMessageNode => new UChatMessageNode(),
    { category: "UChat", namespace: "UChat", label: "UChatMessage" }
  ),
  UChatMessageByString: define(
    (_: NodeDeps) => new UChatMessageByStringNode(),
    {
      category: "UChat",
      namespace: "UChat",
      label: "UChatMessageByString",
    }
  ),
  UPartText: define(
    ({ history, area, dataflow }: NodeDeps): UPartTextNode =>
      new UPartTextNode("", history, area, dataflow),
    { category: "UChat", namespace: "UChat", label: "UPartText" }
  ),
  UChatToOpenAI: define(
    (_: NodeDeps): UChatToOpenAINode => new UChatToOpenAINode(),
    { category: "UChat", namespace: "UChat", label: "UChatToOpenAI" }
  ),
  UChatToLMStudio: define(
    (_: NodeDeps): UChatToLMStudioNode => new UChatToLMStudioNode(),
    {
      category: "UChat",
      namespace: "UChat",
      label: "UChatToLMStudio",
    }
  ),
  UChat: define(
    ({ history, area, dataflow, controlflow }: NodeDeps): UChatNode =>
      new UChatNode([], history, area, dataflow, controlflow),
    { category: "UChat", namespace: "UChat", label: "UChat" }
  ),
  UChatRole: define(
    ({ history, area, dataflow }: NodeDeps): UChatRoleNode =>
      new UChatRoleNode("user", history, area, dataflow),
    { category: "UChat", namespace: "UChat", label: "UChatRole" }
  ),
  ReverseRole: define((_: NodeDeps): ReverseRoleNode => new ReverseRoleNode(), {
    category: "UChat",
    namespace: "UChat",
    label: "ReverseRole",
  }),

  ObjectPick: define(
    ({ area, dataflow }: NodeDeps): ObjectPickNode =>
      new ObjectPickNode(area, dataflow),
    {
      category: "Primitive",
      namespace: "Primitive",
      subcategory: "Object",
      label: "ObjectPick",
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
    {
      category: "Primitive",
      namespace: "Primitive",
      subcategory: "Object",
      label: "JsonSchemaToObject",
    }
  ),
  JsonSchema: define(
    ({ history, area, dataflow }: NodeDeps): JsonSchemaNode =>
      new JsonSchemaNode(history, area, dataflow),
    {
      category: "Primitive",
      namespace: "Primitive",
      subcategory: "Object",
      label: "JsonSchema",
    }
  ),

  // flow
  IF: define(
    ({ history, area, dataflow }: NodeDeps): IFNode =>
      new IFNode(history, area, dataflow),
    {
      category: "Primitive",
      namespace: "Primitive",
      subcategory: "Flow",
      label: "IF",
    }
  ),
  Run: define(
    ({ controlflow }: NodeDeps): RunNode => new RunNode(controlflow),
    {
      category: "Primitive",
      namespace: "Primitive",
      subcategory: "Flow",
      label: "Run",
    }
  ),
  CounterLoop: define(
    ({ history, area, dataflow, controlflow }: NodeDeps): CounterLoopNode =>
      new CounterLoopNode(1, history, area, dataflow, controlflow),
    {
      category: "Primitive",
      namespace: "Primitive",
      subcategory: "Flow",
      label: "CounterLoop",
    }
  ),
} as const satisfies Record<string, FactoryWithMeta>;

// nodeFactories から型を抽出して Schemes.ts 側で利用するための補助型
export type NodeFactoriesType = typeof nodeFactories;

// ===== メニュー生成 =============================================
export interface MenuItemDefinition {
  label: string;
  key: string;
  handler?: () => void;
  // factoryKey は安定ID（namespace:name）を持つ
  factoryKey?: string;
  subitems?: MenuItemDefinition[];
}

const generateKey = (label: string): string =>
  label.toLowerCase().replace(/\s+/g, "-");

interface CategoryMapNode {
  items: { label: string; factoryKey: string }[];
  subcats: Map<string, CategoryMapNode>;
}

// ===== レジストリ: typeId(namespace:name) -> factory =======================
const registry = new Map<string, FactoryWithMeta>();

function ensureRegistry() {
  if (registry.size) return;
  for (const [key, fn] of Object.entries(nodeFactories)) {
    const meta = (fn as FactoryWithMeta).meta ?? {};
    const ns = meta.namespace ?? "core";
    const id = meta.id ?? `${ns}:${key}`;
    (fn as any).meta = { ...meta, namespace: ns, id } satisfies FactoryMeta;
    registry.set(id, fn as FactoryWithMeta);
  }
}

export function getFactoryByTypeId(id: string): FactoryWithMeta | undefined {
  ensureRegistry();
  return registry.get(id);
}

function buildMenuFromMeta(): MenuItemDefinition[] {
  ensureRegistry();
  const categoryMap = new Map<string, CategoryMapNode>();
  for (const fn of registry.values()) {
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
    const displayLabel =
      meta.label ?? ((meta.id as string).split(":").pop() as string);
    const factoryKey = meta.id as string; // 安定ID
    if (sub) {
      let subNode = catNode.subcats.get(sub);
      if (!subNode) {
        subNode = { items: [], subcats: new Map() };
        catNode.subcats.set(sub, subNode);
      }
      subNode.items.push({ label: displayLabel, factoryKey });
    } else {
      catNode.items.push({ label: displayLabel, factoryKey });
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
            // include factory id to avoid collisions
            key: generateKey(`${category}-${sub}-${i.label}-${i.factoryKey}`),
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
        key: generateKey(`${category}-${item.label}-${item.factoryKey}`),
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
