import { Type, type Static } from "@sinclair/typebox";

// Small reusable units
export const ID = Type.String({ description: "Unique identifier" });
export type ID = Static<typeof ID>;

export const Timestamp = Type.Number({
  description: "Unix timestamp in seconds",
});
export type Timestamp = Static<typeof Timestamp>;

export const NullableString = Type.Union([Type.String(), Type.Null()], {
  description: "String or null",
});
export type NullableString = Static<typeof NullableString>;

export const NullableNumber = Type.Union([Type.Number(), Type.Null()], {
  description: "Number or null",
});
export type NullableNumber = Static<typeof NullableNumber>;

export const BooleanOrNull = Type.Union([Type.Boolean(), Type.Null()], {
  description: "Boolean or null",
});
export type BooleanOrNull = Static<typeof BooleanOrNull>;
