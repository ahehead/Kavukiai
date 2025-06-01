// DefaultNodeSchema now delegates to separated schema modules
import { basicSchemas } from "./Schemas/basic";
import { createParamsSchemas } from "./Schemas/createParams";

/* ---------- ノードで使うデフォルトのスキーマ一覧 ---------- */

// merge basic and OpenAI createParams schemas
export const defaultNodeSchemas = {
  ...basicSchemas,
  ...createParamsSchemas,
} as const;

export type DefaultSchemaKey = keyof typeof defaultNodeSchemas;
