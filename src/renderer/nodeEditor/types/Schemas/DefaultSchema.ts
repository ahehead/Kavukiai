import { Type } from "@sinclair/typebox";

export const defaultNodeSchemas = {
  string: Type.String(),
  number: Type.Number(),
  boolean: Type.Boolean(),
  array: Type.Array(Type.Unknown()),
  object: Type.Object({}),
  any: Type.Any(),
  exec: Type.Literal("exec"),
  JsonSchema: Type.Record(Type.String(), Type.Any()),
  StringArray: Type.Array(Type.String()),
  StringOrNull: Type.Union([Type.String(), Type.Null()]),
} as const;

export type DefaultSchemaKey = keyof typeof defaultNodeSchemas;
