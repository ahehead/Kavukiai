import type { Static } from "@sinclair/typebox";
import { Type } from "@sinclair/typebox";

export const ServerStatusInfo = Type.Object({
  server: Type.Union([Type.Literal("ON"), Type.Literal("OFF")]),
  port: Type.Optional(Type.Number()),
  loadedModels: Type.Array(Type.String()),
});
export type ServerStatusInfo = Static<typeof ServerStatusInfo>;
