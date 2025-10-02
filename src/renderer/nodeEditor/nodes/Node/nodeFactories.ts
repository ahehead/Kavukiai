import { OpenAIToUChatCommandNode } from "renderer/nodeEditor/nodes/Node/Chat/OpenAIToUChatCommandNode";
import { ReverseRoleNode } from "renderer/nodeEditor/nodes/Node/Chat/ReverseRoleNode";
import { UChatGetLastMessageNode } from "renderer/nodeEditor/nodes/Node/Chat/UChatGetLastMessageNode";
import { UChatMessageByStringNode } from "renderer/nodeEditor/nodes/Node/Chat/UChatMessageByStringNode";
import { UChatMessageNode } from "renderer/nodeEditor/nodes/Node/Chat/UChatMessageNode";
import { UChatNode } from "renderer/nodeEditor/nodes/Node/Chat/UChatNode";
import { UChatRoleNode } from "renderer/nodeEditor/nodes/Node/Chat/UChatRoleNode";
import { UChatToLMStudioNode } from "renderer/nodeEditor/nodes/Node/Chat/UChatToLMStudioNode";
import { UChatToOpenAINode } from "renderer/nodeEditor/nodes/Node/Chat/UChatToOpenAINode";
import { UChatToStringNode } from "renderer/nodeEditor/nodes/Node/Chat/UChatToStringNode";
import { UPartTextNode } from "renderer/nodeEditor/nodes/Node/Chat/UPartTextNode";
import { ComfyDesktopStartNode } from "renderer/nodeEditor/nodes/Node/ComfyUI/ComfyDesktopStartNode";
import { ComfyUIFreeMemoryNode } from "renderer/nodeEditor/nodes/Node/ComfyUI/ComfyUIFreeMemoryNode";
import { ComfyUINode } from "renderer/nodeEditor/nodes/Node/ComfyUI/ComfyUINode";
import { FetchCheckpointsNode } from "renderer/nodeEditor/nodes/Node/ComfyUI/FetchCheckpointsNode";
import { FetchTemplateWorkflowsNode } from "renderer/nodeEditor/nodes/Node/ComfyUI/FetchTemplateWorkflowsNode";
import { FetchUserWorkflowsNode } from "renderer/nodeEditor/nodes/Node/ComfyUI/FetchUserWorkflowListNode";
import { LoadWorkflowFileNode } from "renderer/nodeEditor/nodes/Node/ComfyUI/LoadWorkflowFileNode";
import { MergeWorkflowInputsDefaultsNode } from "renderer/nodeEditor/nodes/Node/ComfyUI/MergeWorkflowInputsDefaultsNode";
import { WorkflowInputsNode } from "renderer/nodeEditor/nodes/Node/ComfyUI/WorkflowInputsNode";
import { WorkflowOutputsNode } from "renderer/nodeEditor/nodes/Node/ComfyUI/WorkflowOutputsNode";
import { WorkflowRefToApiWorkflowNode } from "renderer/nodeEditor/nodes/Node/ComfyUI/WorkflowRefToApiWorkflowNode";
import { TestNode } from "renderer/nodeEditor/nodes/Node/Debug/TestNode";
import { UnknownNode } from "renderer/nodeEditor/nodes/Node/Debug/UnknownNode";
import { InspectorNode } from "renderer/nodeEditor/nodes/Node/InspectorNode";
import { FetchModelInfosNode } from "renderer/nodeEditor/nodes/Node/LMStudio/FetchModelInfosNode";
import { ListDownloadedModelsNode } from "renderer/nodeEditor/nodes/Node/LMStudio/ListDownloadedModelsNode";
import { LLMPredictionConfigNode } from "renderer/nodeEditor/nodes/Node/LMStudio/LLMPredictionConfigNode";
import { LMStudioChatNode } from "renderer/nodeEditor/nodes/Node/LMStudio/LMStudioChatNode";
import { LMStudioLoadModelNode } from "renderer/nodeEditor/nodes/Node/LMStudio/LMStudioLoadModelNode";
import { LMStudioStartNode } from "renderer/nodeEditor/nodes/Node/LMStudio/LMStudioStartNode";
import { LMStudioStopNode } from "renderer/nodeEditor/nodes/Node/LMStudio/LMStudioStopNode";
import { ModelInfoToModelListNode } from "renderer/nodeEditor/nodes/Node/LMStudio/ModelInfoToModelListNode";
import { ServerStatusNode } from "renderer/nodeEditor/nodes/Node/LMStudio/ServerStatusNode";
import { UnLoadModelNode } from "renderer/nodeEditor/nodes/Node/LMStudio/UnLoadModelNode";
import { JsonSchemaFormatNode } from "renderer/nodeEditor/nodes/Node/OpenAI/JsonSchemaFormatNode";
import { OpenAINode } from "renderer/nodeEditor/nodes/Node/OpenAI/OpenAI";
import { ResponseCreateParamsBaseNode } from "renderer/nodeEditor/nodes/Node/OpenAI/ResponseCreateParamsBaseNode";
import { ResponseTextConfigNode } from "renderer/nodeEditor/nodes/Node/OpenAI/ResponseTextConfigNode";
import { ArrayNode } from "renderer/nodeEditor/nodes/Node/Primitive/Array/ArrayNode";
import { JoinNode } from "renderer/nodeEditor/nodes/Node/Primitive/Array/JoinNode";
import { ToArrayNode } from "renderer/nodeEditor/nodes/Node/Primitive/Array/ToArrayNode";
import { BoolNode } from "renderer/nodeEditor/nodes/Node/Primitive/BoolNode";
import { CreateSelectNode } from "renderer/nodeEditor/nodes/Node/Primitive/CreateSelectNode";
import { CounterLoopNode } from "renderer/nodeEditor/nodes/Node/Primitive/Flow/CounterLoopNode";
import { IFNode } from "renderer/nodeEditor/nodes/Node/Primitive/Flow/IFNode";
import { RunNode } from "renderer/nodeEditor/nodes/Node/Primitive/Flow/RunNode";
import { SelectImageNode } from "renderer/nodeEditor/nodes/Node/Primitive/Image/SelectImageNode";
import { ShowImageNode } from "renderer/nodeEditor/nodes/Node/Primitive/Image/ShowImageNode";
import { NumberNode } from "renderer/nodeEditor/nodes/Node/Primitive/NumberNode";
import { JsonSchemaNode } from "renderer/nodeEditor/nodes/Node/Primitive/Object/JsonSchemaNode";
import { JsonSchemaToObjectNode } from "renderer/nodeEditor/nodes/Node/Primitive/Object/JsonSchemaToObject";
import { ObjectPickNode } from "renderer/nodeEditor/nodes/Node/Primitive/Object/ObjectPickNode";
import { ParseJsonAndPickNode } from "renderer/nodeEditor/nodes/Node/Primitive/Object/ParseJsonAndPickNode";
import { ParseJsonToObjectNode } from "renderer/nodeEditor/nodes/Node/Primitive/Object/ParseJsonToObjectNode";
import { AutoTemplateReplaceNode } from "renderer/nodeEditor/nodes/Node/Primitive/String/AutoTemplateReplaceNode";
import { CodeFenceNode } from "renderer/nodeEditor/nodes/Node/Primitive/String/CodeFenceNode";
import { DefaultStringNode } from "renderer/nodeEditor/nodes/Node/Primitive/String/DefaultStringNode";
import { JsonFilePathNode } from "renderer/nodeEditor/nodes/Node/Primitive/String/JsonFilePathNode";
import { MultiLineStringNode } from "renderer/nodeEditor/nodes/Node/Primitive/String/MultiLineStringNode";
import { NumberToStringNode } from "renderer/nodeEditor/nodes/Node/Primitive/String/NumberToStringNode";
import { ObjectToStringNode } from "renderer/nodeEditor/nodes/Node/Primitive/String/ObjectToStringNode";
import { ObjectToYAMLStringNode } from "renderer/nodeEditor/nodes/Node/Primitive/String/ObjectToYAMLStringNode";
import { StringFormNode } from "renderer/nodeEditor/nodes/Node/Primitive/String/StringFormNode";
import { StringNode } from "renderer/nodeEditor/nodes/Node/Primitive/String/StringNode";
import { TemplateReplaceNode } from "renderer/nodeEditor/nodes/Node/Primitive/String/TemplateReplaceNode";

import type {
  FactoryWithMeta,
  NodeDeps,
} from "../../features/nodeFactory/factoryTypes";
// ===== Factory + Meta 定義 =====================================
// カテゴリ & サブカテゴリ情報を meta に付与し、メニュー構築を自動化する。
import { define } from "../../features/nodeFactory/factoryTypes";

export const factoryList = [
  // Primitive / String
  define(({ message }: NodeDeps): UnknownNode => new UnknownNode(message), {
    categories: ["Debug"],
    op: "Unknown",
    label: "Unknown",
    devOnly: true,
  }),
  define((_: NodeDeps): TestNode => new TestNode(), {
    categories: ["Debug"],
    op: "Test",
    label: "Test",
    devOnly: true,
  }),
  define(
    ({ dataflow, area, controlflow }: NodeDeps): InspectorNode =>
      new InspectorNode(dataflow, area, controlflow),
    { categories: [], op: "Inspector", label: "Inspector" }
  ),

  define(
    ({ history, area, dataflow }: NodeDeps): StringNode =>
      new StringNode("", history, area, dataflow),
    {
      categories: ["Primitive", "String"],
      op: "String",
      label: "String",
    }
  ),
  define(
    ({ history, area, dataflow }: NodeDeps): MultiLineStringNode =>
      new MultiLineStringNode("", history, area, dataflow),
    {
      categories: ["Primitive", "String"],
      op: "MultiLineString",
      label: "Multi Line String",
    }
  ),
  define(
    ({ dataflow, controlflow }: NodeDeps): TemplateReplaceNode =>
      new TemplateReplaceNode(dataflow, controlflow),
    {
      categories: ["Primitive", "String"],
      op: "TemplateReplace",
      label: "Template Replace",
    }
  ),
  define(
    (_: NodeDeps): AutoTemplateReplaceNode => new AutoTemplateReplaceNode(),
    {
      categories: ["Primitive", "String"],
      op: "AutoTemplateReplace",
      label: "Auto Template Replace",
    }
  ),
  define(
    ({ history, area, dataflow }: NodeDeps): JsonFilePathNode =>
      new JsonFilePathNode("", history, area, dataflow),
    {
      categories: ["Primitive", "String"],
      op: "JsonFilePath",
      label: "JSON File Path",
    }
  ),
  define(
    ({ history, area, dataflow, controlflow }: NodeDeps): StringFormNode =>
      new StringFormNode("", history, area, dataflow, controlflow),
    {
      categories: ["Primitive", "String"],
      op: "StringForm",
      label: "String Form",
    }
  ),
  define(({ dataflow }: NodeDeps): JoinNode => new JoinNode(dataflow), {
    categories: ["Primitive", "Array"],
    op: "Join",
    label: "Join",
  }),
  define((_: NodeDeps): NumberToStringNode => new NumberToStringNode(), {
    categories: ["Primitive", "Number"],
    op: "NumberToString",
    label: "Number To String",
  }),
  define((_: NodeDeps): ObjectToStringNode => new ObjectToStringNode(), {
    categories: ["Primitive", "Object"],
    op: "ObjectToString",
    label: "Object To String",
  }),
  define(
    (_: NodeDeps): ObjectToYAMLStringNode => new ObjectToYAMLStringNode(),
    {
      categories: ["Primitive", "Object"],
      op: "ObjectToYAMLString",
      label: "Object To YAML String",
    }
  ),
  define(
    ({ dataflow }: NodeDeps): CodeFenceNode => new CodeFenceNode(dataflow),
    {
      categories: ["Primitive", "String"],
      op: "CodeFence",
      label: "Code Fence",
    }
  ),

  define(
    ({ history, area, dataflow }: NodeDeps): NumberNode =>
      new NumberNode(0, history, area, dataflow),
    { categories: ["Primitive", "Number"], op: "Number", label: "Number" }
  ),
  define(
    ({ history, area, dataflow }: NodeDeps): BoolNode =>
      new BoolNode(history, area, dataflow),
    { categories: ["Primitive", "Boolean"], op: "Bool", label: "Bool" }
  ),

  define(
    ({ area, dataflow, controlflow }: NodeDeps): ArrayNode =>
      new ArrayNode(area, dataflow, controlflow),
    {
      categories: ["Primitive", "Array"],
      op: "Array",
      label: "Array",
    }
  ),

  define(
    ({ area, dataflow }: NodeDeps): ToArrayNode =>
      new ToArrayNode(area, dataflow),
    {
      categories: ["Primitive", "Array"],
      op: "ToArray",
      label: "To Array",
    }
  ),
  define(
    ({ dataflow, controlflow }: NodeDeps): CreateSelectNode =>
      new CreateSelectNode(dataflow, controlflow),
    {
      categories: ["Primitive"],
      op: "CreateSelect",
      label: "Create Select",
    }
  ),
  define(
    ({ history, area, dataflow }: NodeDeps): SelectImageNode =>
      new SelectImageNode(history, area, dataflow),
    {
      categories: ["Primitive", "Image"],
      op: "SelectImage",
      label: "Select Image",
    }
  ),
  define(
    ({ area, dataflow, controlflow }: NodeDeps): ShowImageNode =>
      new ShowImageNode(area, dataflow, controlflow),
    {
      categories: ["Primitive", "Image"],
      op: "ShowImage",
      label: "Show Image",
    }
  ),

  // lmstudio nodes
  define(
    ({ dataflow, controlflow }: NodeDeps): ListDownloadedModelsNode =>
      new ListDownloadedModelsNode(dataflow, controlflow),
    {
      categories: ["LMStudio"],
      op: "ListDownloadedModels",
      label: "List Downloaded Models",
    }
  ),
  define(
    ({ dataflow, controlflow }: NodeDeps): FetchModelInfosNode =>
      new FetchModelInfosNode(dataflow, controlflow),
    {
      categories: ["LMStudio"],
      op: "FetchModelInfos",
      label: "Fetch Model Infos",
    }
  ),
  define(
    (_: NodeDeps): ModelInfoToModelListNode => new ModelInfoToModelListNode(),
    {
      categories: ["LMStudio"],
      op: "ModelInfoToModelList",
      label: "Model Info To Model List",
    }
  ),
  define(
    ({ area, dataflow, controlflow }: NodeDeps): LMStudioChatNode =>
      new LMStudioChatNode(area, dataflow, controlflow),
    {
      categories: ["LMStudio"],
      op: "LMStudioChat",
      label: "LM Studio Client",
    }
  ),
  define(
    ({ controlflow }: NodeDeps): LMStudioStartNode =>
      new LMStudioStartNode(controlflow),
    {
      categories: ["LMStudio"],
      op: "LMStudioStart",
      label: "Server Start",
    }
  ),
  define(
    ({ controlflow }: NodeDeps): LMStudioStopNode =>
      new LMStudioStopNode(controlflow),
    {
      categories: ["LMStudio"],
      op: "LMStudioStop",
      label: "Server Stop",
    }
  ),
  define(
    ({ area, dataflow, controlflow }: NodeDeps): LMStudioLoadModelNode =>
      new LMStudioLoadModelNode(area, dataflow, controlflow),
    {
      categories: ["LMStudio"],
      op: "LMStudioLoadModel",
      label: "Load Model",
    }
  ),
  define(
    ({ dataflow, controlflow }: NodeDeps): ServerStatusNode =>
      new ServerStatusNode(dataflow, controlflow),
    {
      categories: ["LMStudio"],
      op: "ServerStatus",
      label: "Server Status",
    }
  ),
  define(
    ({ controlflow }: NodeDeps): UnLoadModelNode =>
      new UnLoadModelNode(controlflow),
    {
      categories: ["LMStudio"],
      op: "UnLoadModel",
      label: "Unload Model",
    }
  ),
  define(
    ({ dataflow }: NodeDeps): LLMPredictionConfigNode =>
      new LLMPredictionConfigNode(dataflow),
    {
      categories: ["LMStudio"],
      op: "LLMPredictionConfig",
      label: "LLM Prediction Config",
    }
  ),

  // ComfyUI
  define(
    ({ area, history, dataflow, controlflow }: NodeDeps): ComfyUINode =>
      new ComfyUINode(area, history, dataflow, controlflow),
    { categories: ["ComfyUI"], op: "ComfyUI", label: "ComfyUI Client" }
  ),
  define(
    ({ area, dataflow, controlflow }: NodeDeps): ComfyDesktopStartNode =>
      new ComfyDesktopStartNode(area, dataflow, controlflow),
    {
      categories: ["ComfyUI"],
      op: "ComfyDesktopStart",
      label: "Comfy Desktop Start",
    }
  ),
  define(
    ({
      area,
      history,
      dataflow,
      controlflow,
    }: NodeDeps): ComfyUIFreeMemoryNode =>
      new ComfyUIFreeMemoryNode(area, history, dataflow, controlflow),
    {
      categories: ["ComfyUI"],
      op: "ComfyUIFreeMemory",
      label: "ComfyUI Free Memory",
    }
  ),
  define(
    ({
      area,
      history,
      dataflow,
      controlflow,
    }: NodeDeps): WorkflowRefToApiWorkflowNode =>
      new WorkflowRefToApiWorkflowNode(area, history, dataflow, controlflow),
    {
      categories: ["ComfyUI"],
      op: "WorkflowRefToApiWorkflow",
      label: "Workflow Ref To API Workflow",
    }
  ),
  define(
    ({ area, dataflow, controlflow }: NodeDeps): LoadWorkflowFileNode =>
      new LoadWorkflowFileNode(area, dataflow, controlflow),
    {
      categories: ["ComfyUI"],
      op: "LoadWorkflowFile",
      label: "Load Workflow File",
    }
  ),
  define(
    ({
      area,
      history,
      dataflow,
      controlflow,
    }: NodeDeps): FetchTemplateWorkflowsNode =>
      new FetchTemplateWorkflowsNode(area, history, dataflow, controlflow),
    {
      categories: ["ComfyUI"],
      op: "FetchTemplateWorkflows",
      label: "Fetch Template Workflows",
    }
  ),
  define(
    ({
      area,
      history,
      dataflow,
      controlflow,
    }: NodeDeps): FetchCheckpointsNode =>
      new FetchCheckpointsNode(area, history, dataflow, controlflow),
    {
      categories: ["ComfyUI"],
      op: "FetchCheckpoints",
      label: "Fetch Checkpoints",
    }
  ),
  define(
    ({
      area,
      history,
      dataflow,
      controlflow,
    }: NodeDeps): FetchUserWorkflowsNode =>
      new FetchUserWorkflowsNode(area, history, dataflow, controlflow),
    {
      categories: ["ComfyUI"],
      op: "FetchUserWorkflows",
      label: "Fetch User Workflows",
    }
  ),
  define(
    ({ history, area, dataflow, controlflow }: NodeDeps): WorkflowInputsNode =>
      new WorkflowInputsNode(history, area, dataflow, controlflow),
    {
      categories: ["ComfyUI"],
      op: "WorkflowInputs",
      label: "Workflow Inputs",
    }
  ),
  define(
    ({ history, area, dataflow, controlflow }: NodeDeps): WorkflowOutputsNode =>
      new WorkflowOutputsNode(history, area, dataflow, controlflow),
    {
      categories: ["ComfyUI"],
      op: "WorkflowOutputs",
      label: "Workflow Outputs",
    }
  ),
  define(
    (_: NodeDeps): MergeWorkflowInputsDefaultsNode =>
      new MergeWorkflowInputsDefaultsNode(),
    {
      categories: ["ComfyUI"],
      op: "MergeWorkflowInputsDefaults",
      label: "Merge Workflow Inputs Defaults",
    }
  ),

  // OpenAI nodes
  define(
    ({ area, dataflow, controlflow }: NodeDeps): OpenAINode =>
      new OpenAINode(area, dataflow, controlflow),
    { categories: ["OpenAI"], op: "OpenAI", label: "OpenAI Client" }
  ),
  define(
    ({ history, area, dataflow }: NodeDeps): ResponseCreateParamsBaseNode =>
      new ResponseCreateParamsBaseNode(history, area, dataflow),
    {
      categories: ["OpenAI"],
      op: "ResponseCreateParamsBase",
      label: "Response Create Params Base",
    }
  ),
  define(
    ({ history, area, dataflow }: NodeDeps): JsonSchemaFormatNode =>
      new JsonSchemaFormatNode(history, area, dataflow),
    {
      categories: ["OpenAI"],
      op: "JsonSchemaFormat",
      label: "JSON Schema Format",
    }
  ),
  define(
    (_: NodeDeps): ResponseTextConfigNode => new ResponseTextConfigNode(),
    {
      categories: ["OpenAI"],
      op: "ResponseTextConfig",
      label: "Response Text Config",
    }
  ),

  // chat / UChat
  define((_: NodeDeps): UChatToStringNode => new UChatToStringNode(), {
    categories: ["UChat"],
    op: "UChatToString",
    label: "UChat To String",
  }),
  define(
    (_: NodeDeps): UChatGetLastMessageNode => new UChatGetLastMessageNode(),
    {
      categories: ["UChat"],
      op: "UChatGetLastMessage",
      label: "UChat Get Last Message",
    }
  ),
  define(
    (_: NodeDeps): OpenAIToUChatCommandNode => new OpenAIToUChatCommandNode(),
    {
      categories: ["UChat"],
      op: "OpenAIToUChatCommand",
      label: "OpenAI To UChat Command",
    }
  ),
  define((_: NodeDeps): UChatMessageNode => new UChatMessageNode(), {
    categories: ["UChat"],
    op: "UChatMessage",
    label: "UChat Message",
  }),
  define((_: NodeDeps) => new UChatMessageByStringNode(), {
    categories: ["UChat"],
    op: "UChatMessageByString",
    label: "UChat Message By String",
  }),
  define(
    ({ history, area, dataflow }: NodeDeps): UPartTextNode =>
      new UPartTextNode("", history, area, dataflow),
    { categories: ["UChat"], op: "UPartText", label: "U Part Text" }
  ),
  define((_: NodeDeps): UChatToOpenAINode => new UChatToOpenAINode(), {
    categories: ["UChat"],
    op: "UChatToOpenAI",
    label: "UChat To OpenAI",
  }),
  define((_: NodeDeps): UChatToLMStudioNode => new UChatToLMStudioNode(), {
    categories: ["UChat"],
    op: "UChatToLMStudio",
    label: "UChat To LM Studio",
  }),
  define(
    ({ history, area, dataflow, controlflow }: NodeDeps): UChatNode =>
      new UChatNode([], history, area, dataflow, controlflow),
    { categories: ["UChat"], op: "UChat", label: "UChat" }
  ),
  define(
    ({ history, area, dataflow }: NodeDeps): UChatRoleNode =>
      new UChatRoleNode("user", history, area, dataflow),
    { categories: ["UChat"], op: "UChatRole", label: "UChat Role" }
  ),
  define((_: NodeDeps): ReverseRoleNode => new ReverseRoleNode(), {
    categories: ["UChat"],
    op: "ReverseRole",
    label: "Reverse Role",
  }),

  define(
    ({ area, dataflow }: NodeDeps): ObjectPickNode =>
      new ObjectPickNode(area, dataflow),
    {
      categories: ["Primitive", "Object"],
      op: "ObjectPick",
      label: "Object Pick",
    }
  ),
  define(
    ({
      editor,
      history,
      area,
      dataflow,
      controlflow,
    }: NodeDeps): JsonSchemaToObjectNode =>
      new JsonSchemaToObjectNode(editor, history, area, dataflow, controlflow),
    {
      categories: ["Primitive", "Object"],
      op: "JsonSchemaToObject",
      label: "JSON Schema To Object",
    }
  ),
  define(
    ({ history, area, dataflow }: NodeDeps): JsonSchemaNode =>
      new JsonSchemaNode(history, area, dataflow),
    {
      categories: ["Primitive", "Object"],
      op: "JsonSchema",
      label: "JSON Schema",
    }
  ),
  define(
    ({ editor, area, dataflow, controlflow }: NodeDeps): ParseJsonAndPickNode =>
      new ParseJsonAndPickNode(editor, area, dataflow, controlflow),
    {
      categories: ["Primitive", "Object"],
      op: "ParseJsonAndPick",
      label: "Parse JSON And Pick",
    }
  ),
  define((_: NodeDeps): ParseJsonToObjectNode => new ParseJsonToObjectNode(), {
    categories: ["Primitive", "Object"],
    op: "ParseJsonToObject",
    label: "Parse JSON To Object",
  }),
  define(
    ({ history, area, dataflow }: NodeDeps): DefaultStringNode =>
      new DefaultStringNode(history, area, dataflow),
    {
      categories: ["Primitive", "String"],
      op: "DefaultString",
      label: "Default String",
    }
  ),

  // flow
  define(
    ({ history, area, dataflow }: NodeDeps): IFNode =>
      new IFNode(history, area, dataflow),
    {
      categories: ["Primitive", "Flow"],
      op: "IF",
      label: "IF",
    }
  ),
  define(({ controlflow }: NodeDeps): RunNode => new RunNode(controlflow), {
    categories: ["Primitive", "Flow"],
    op: "Run",
    label: "Run",
  }),
  define(
    ({ history, area, dataflow, controlflow }: NodeDeps): CounterLoopNode =>
      new CounterLoopNode(1, history, area, dataflow, controlflow),
    {
      categories: ["Primitive", "Flow"],
      op: "CounterLoop",
      label: "Counter Loop",
    }
  ),
];

// 逆引き (後方互換): op をキーにレコードを生成
export const nodeFactories = Object.fromEntries(
  factoryList.map((f) => [f.meta.op, f])
) as Record<string, FactoryWithMeta>;

// ===== 開発時アサーション ========================================
if (import.meta.env?.DEV) {
  try {
    for (const factory of factoryList) {
      // 一部重いノードを避けたい場合はスキップ条件をここで追加可能
      const meta = factory.meta;
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
      const expectedLabel = meta.label;
      try {
        const instance = factory(dummy);
        instanceLabel = instance?.label;
      } catch {
        // 生成失敗はラベル検証だけなので握りつぶし
      }
      if (expectedLabel && instanceLabel && instanceLabel !== expectedLabel) {
        // eslint-disable-next-line no-console
        console.warn(
          `[factoryList] meta.label '${expectedLabel}' とインスタンス label '${instanceLabel}' 不一致`
        );
      }
    }
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn("nodeFactories dev assertion failed", e);
  }
}
