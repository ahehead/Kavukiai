// restore-kind.ts
import { Kind } from "@sinclair/typebox";

/**
 * json schemaをtypeboxSchemaに戻すための関数
 * 与えられた JSON Schema (TypeBox 由来) を再帰的に走査し、
 * `type` などの情報から失われた `[Kind]` メタを付け直す。
 *
 * 1. 文字列型の `type` があればそれをそのまま Kind に設定
 * 2. `anyOf | oneOf` → 'Union', `allOf` → 'Intersect'
 * 3. `$ref`        → 'Ref'
 * 4. 上記以外はスキップ
 *
 * @param schema  JSON.parse 直後の Plain Object
 * @returns       同じ参照（破壊的に付与する）
 */
export function restoreKind<T>(schema: T): T {
  const walk = (node: unknown): void => {
    if (node && typeof node === "object") {
      // --- ① primitive type -----------------------------
      if (typeof (node as any).type === "string" && !(Kind in (node as any))) {
        (node as any)[Kind] = (node as any).type.replace(/^\w/, (c: string) =>
          c.toUpperCase()
        );
      }

      // --- ②〜④ composite／参照型 ------------------------
      if ("anyOf" in (node as any) || "oneOf" in (node as any)) {
        (node as any)[Kind] = "Union";
      } else if ("allOf" in (node as any)) {
        (node as any)[Kind] = "Intersect";
      } else if ("$ref" in (node as any)) {
        (node as any)[Kind] = "Ref";
      }

      // --- 再帰 ---------------------------
      for (const value of Object.values(node)) {
        if (Array.isArray(value)) value.forEach(walk);
        else walk(value);
      }
    }
  };

  walk(schema);
  return schema;
}

/* ------------------------------------------------------
   使い方
--------------------------------------------------------- */
// ① TypeBox で作ったスキーマを JSON へ
// const T = Type.Object({ id: Type.String() })
// const json = JSON.stringify(T)           // Kind が消える
// ② 読み戻して Kind を復元
// const parsed = JSON.parse(json)
// restoreKind(parsed)
// console.log(parsed[Kind]) // 'object' など
