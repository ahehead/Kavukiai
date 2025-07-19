import { getContextMenuPath } from "renderer/nodeEditor/nodes/util/getContextMenuPath";
import { describe, expect, it } from "vitest";

describe("getContextMenuPath", () => {
  vi.stubGlobal("window", { App: {} });
  it("returns empty string for unknown key", () => {
    expect(getContextMenuPath("NonExistent" as any)).toBe("");
  });

  it("returns Primitive/String for String key", () => {
    expect(getContextMenuPath("String")).toBe("Primitive/String");
  });

  it("returns Primitive/Flow/IF for IF key", () => {
    expect(getContextMenuPath("IF")).toBe("Primitive/Flow/IF");
  });

  it("returns OpenAI for OpenAI key", () => {
    expect(getContextMenuPath("OpenAI")).toBe("OpenAI");
  });

  it("returns OpenAI for ResponseInputMessageItemList key", () => {
    expect(getContextMenuPath("ResponseInputMessageItemList")).toBe("OpenAI");
  });
});
