import { type Static, Type } from "@sinclair/typebox";
import { WorkflowRef } from "./workflow-ref.schema";

export const WorkflowInputs = Type.Record(
  Type.String(),
  Type.Object({
    path: Type.String(),
    default: Type.Optional(Type.Any()),
  })
);

export type WorkflowInputs = Static<typeof WorkflowInputs>;

export const WorkflowOutputs = Type.Record(
  Type.String(),
  Type.Object({
    path: Type.String(),
  })
);

export type WorkflowOutputs = Static<typeof WorkflowOutputs>;

/**
 * PromptRecipe 用の TypeBox スキーマ
 */
export const PromptRunOpts = Type.Object(
  {
    forceWs: Type.Optional(Type.Boolean()),
    wsTimeout: Type.Optional(Type.Integer({ minimum: 0 })),
    maxTries: Type.Optional(Type.Integer({ minimum: 0 })),
    delayTime: Type.Optional(Type.Integer({ minimum: 0 })),
  },
  { additionalProperties: false, description: "Options for running Prompt" }
);
export type PromptRunOpts = Static<typeof PromptRunOpts>;

export const PromptRecipe = Type.Object(
  {
    endpoint: Type.String({ description: "ComfyUI API endpoint URL" }),
    workflowRef: WorkflowRef,
    opts: Type.Optional(PromptRunOpts),
    // inputs を Optional 化 (workflow がデフォルト値を全て内包しているケースなどを許容)
    inputs: Type.Optional(WorkflowInputs),
    outputs: Type.Optional(WorkflowOutputs),
    bypass: Type.Optional(Type.Array(Type.String())),
  },
  {
    additionalProperties: false,
    description: "PromptRecipe schema (workflowRef 指定)",
  }
);

export type PromptRecipe = Static<typeof PromptRecipe>;
