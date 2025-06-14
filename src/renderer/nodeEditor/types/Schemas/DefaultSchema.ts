import { Type } from "@sinclair/typebox";

export const defaultNodeSchemas = {
  string: Type.String(),
  number: Type.Number(),
  boolean: Type.Boolean(),
  array: Type.Array(Type.Unknown()),
  object: Type.Object({}),
  any: Type.Any(),
} as const;

export type DefaultSchemaKey = keyof typeof defaultNodeSchemas;
