import { type Static, Type } from "@sinclair/typebox";
import type { UFileRef, UPart } from "nodes/Chat/common/schema";

/**
 * ノード間で使うファイル参照（UFileRef 互換 + blob 対応）
 * url / id / path / data に加え、blob を直接渡せる variant を追加
 */
export const NodeFileRef = Type.Union([
  Type.Object({ kind: Type.Literal("url"), url: Type.String() }),
  Type.Object({ kind: Type.Literal("id"), id: Type.String() }),
  Type.Object({ kind: Type.Literal("path"), path: Type.String() }),
  Type.Object({
    kind: Type.Literal("data"),
    data: Type.String(),
    encoding: Type.Union([Type.Literal("base64"), Type.Literal("utf8")]),
  }),
  // Blob は JSON 不能のため schema 上は unknown とする
  Type.Object({
    kind: Type.Literal("blob"),
    blob: Type.Unknown(),
    name: Type.Optional(Type.String()),
  }),
]);
export type NodeFileRef = Static<typeof NodeFileRef>;

/** ノード間でやり取りする画像データ */
export const NodeImage = Type.Object({
  id: Type.String(),
  source: NodeFileRef,
  alt: Type.Optional(Type.String()),
  mime: Type.Optional(Type.String()),
});
export type NodeImage = Static<typeof NodeImage>;

/** Blob を UFileRef へ解決するためのリゾルバ（保存/変換などを実装側に委譲） */
export interface NodeImageResolver {
  blobToUFile(blob: Blob, name?: string): Promise<UFileRef>;
}

/** type guard */
export function isBlobRef(
  ref: NodeFileRef
): ref is Extract<NodeFileRef, { kind: "blob" }> {
  return (ref as any)?.kind === "blob";
}

/** 生成ヘルパー */
export function createNodeImageFromUrl(
  url: string,
  alt?: string,
  mime?: string
): NodeImage {
  return { id: genNodeImageId(), source: { kind: "url", url }, alt, mime };
}
export function createNodeImageFromPath(
  path: string,
  alt?: string,
  mime?: string
): NodeImage {
  return { id: genNodeImageId(), source: { kind: "path", path }, alt, mime };
}
export function createNodeImageFromData(
  data: string,
  encoding: "base64" | "utf8",
  alt?: string,
  mime?: string
): NodeImage {
  return {
    id: genNodeImageId(),
    source: { kind: "data", data, encoding },
    alt,
    mime,
  };
}
export function createNodeImageFromBlob(
  blob: Blob,
  alt?: string,
  name?: string,
  mime?: string
): NodeImage {
  return {
    id: genNodeImageId(),
    source: { kind: "blob", blob: blob as unknown, name },
    alt,
    mime: mime ?? (blob.type || undefined),
  };
}

/** NodeFileRef -> UFileRef 変換（blob は resolver 必須） */
export async function toUFileRefFromNode(
  ref: NodeFileRef,
  resolver?: NodeImageResolver
): Promise<UFileRef> {
  switch (ref.kind) {
    case "url":
      return { kind: "url", url: ref.url };
    case "id":
      return { kind: "id", id: ref.id };
    case "path":
      return { kind: "path", path: ref.path };
    case "data":
      return { kind: "data", data: ref.data, encoding: ref.encoding };
    case "blob": {
      if (!resolver) {
        throw new Error(
          "blob を UFileRef に変換するには resolver.blobToUFile が必要です。"
        );
      }
      const blob = (ref as any).blob as Blob;
      return resolver.blobToUFile(blob, ref.name);
    }
  }
}

/** NodeImage -> UPart(image) へ変換 */
export async function toUPartImage(
  img: NodeImage,
  resolver?: NodeImageResolver
): Promise<UPart> {
  const source = await toUFileRefFromNode(img.source, resolver);
  return { type: "image", source, mime: img.mime } as UPart;
}

export const NodeImageArray = Type.Array(NodeImage);
export type NodeImageArray = Static<typeof NodeImageArray>;

export const ImageArrayOrNull = Type.Union([NodeImageArray, Type.Null()]);
export type ImageArrayOrNull = Static<typeof ImageArrayOrNull>;

/** 内部用: NodeImage の一意IDを生成 */
function genNodeImageId(): string {
  try {
    if (
      typeof crypto !== "undefined" &&
      typeof crypto.randomUUID === "function"
    ) {
      return crypto.randomUUID();
    }
  } catch {
    // ignore and fallback
  }
  // Fallback (not RFC4122): sufficiently unique for UI identity
  return `${Math.random().toString(36).slice(2)}-${Date.now().toString(36)}`;
}

export const NodeImageOrArray = Type.Union([NodeImage, NodeImageArray]);
export type NodeImageOrArray = Static<typeof NodeImageOrArray>;

export const NodeImageOrArrayOrNull = Type.Union([
  NodeImageOrArray,
  Type.Null(),
]);
export type NodeImageOrArrayOrNull = Static<typeof NodeImageOrArrayOrNull>;
