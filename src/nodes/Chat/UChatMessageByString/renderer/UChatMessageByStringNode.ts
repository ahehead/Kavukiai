import {
  SerializableInputsNode,
  type TypedSocket,
} from "renderer/nodeEditor/types";
import {
  type NodeImage,
  type NodeImageResolver,
  toUPartImage,
} from "renderer/nodeEditor/types/Schemas/NodeImage";
import type {
  UChatMessage,
  UChatRole,
  UPart,
} from "@nodes/Chat/common/schema/UChatMessage";

// role, text, img(NodeImage) から UChatMessage を組み立てるノード
export class UChatMessageByStringNode extends SerializableInputsNode<
  "UChatMessageByString",
  { role: TypedSocket; text: TypedSocket; img: TypedSocket },
  { out: TypedSocket },
  object
> {
  constructor() {
    super("UChatMessageByString");
    this.addInputPort([
      { key: "role", typeName: "UChatRole", label: "role" },
      { key: "text", typeName: "string", label: "text" },
      { key: "img", typeName: "NodeImage", label: "image" },
    ]);
    this.addOutputPort({
      key: "out",
      typeName: "UChatMessage",
      label: "message",
    });
  }

  async data(inputs: {
    role?: UChatRole[];
    text?: string[];
    img?: NodeImage[];
  }): Promise<{ out: UChatMessage }> {
    const role = inputs.role?.[0] ?? "user";
    const content: UPart[] = [];

    const text = inputs.text?.[0] ?? "";
    if (text && text.length > 0) {
      content.push({ type: "text", text });
    }

    const img = inputs.img?.[0];
    if (img) {
      // Blob -> base64(data) へ変換して UFileRef として格納
      const resolver: NodeImageResolver = {
        async blobToUFile(blob: Blob, _name?: string) {
          const buffer = await blob.arrayBuffer();
          const base64 = bufferToBase64(buffer);
          return { kind: "data", data: base64, encoding: "base64" };
        },
      };
      const imgPart = await toUPartImage(img, resolver);
      // 画像パートはテキストの後ろ
      content.push(imgPart as UPart);
    }

    return { out: { role, content } };
  }
}

function bufferToBase64(buffer: ArrayBuffer): string {
  // Convert ArrayBuffer to base64 string in browser-safe way
  let binary = "";
  const bytes = new Uint8Array(buffer);
  const chunkSize = 0x8000; // avoid call stack limits
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, i + chunkSize);
    binary += String.fromCharCode.apply(null, Array.from(chunk));
  }
  return btoa(binary);
}

