import { Group } from "renderer/nodeEditor/features/group";
import { describe, expect, it } from "vitest";

const baseRect = { left: 0, top: 0, width: 120, height: 80 };

describe("Group style serialization", () => {
  it("omits undefined styles from json output", () => {
    const group = new Group("Untitled");
    const json = group.toJson();
    expect(json).not.toHaveProperty("bgColor");
    expect(json).not.toHaveProperty("fontColor");
  });

  it("serializes and restores style colors", () => {
    const group = new Group("Styled");
    group.applyStyle({ bgColor: "#ffffffff", fontColor: "#000000ff" });

    const json = group.toJson();
    expect(json.bgColor).toBe("#ffffffff");
    expect(json.fontColor).toBe("#000000ff");

    const revived = Group.fromJson({
      ...json,
      rect: { ...json.rect },
      links: [...json.links],
      bgColor: "#abc",
      fontColor: "#12345678",
    });

    expect(revived.bgColor).toBeUndefined();
    expect(revived.fontColor).toBe("#12345678");
  });

  it("trims style values and supports clearing", () => {
    const jsonLike = {
      id: "g1",
      text: "Trimmed",
      rect: baseRect,
      links: [] as string[],
      bgColor: "  #FF0000FF  ",
      fontColor: "\t#00FF00CC",
    };

    const group = Group.fromJson(jsonLike);
    expect(group.bgColor).toBe("#ff0000ff");
    expect(group.fontColor).toBe("#00ff00cc");

    group.applyStyle({ bgColor: null, fontColor: null });
    expect(group.bgColor).toBeUndefined();
    expect(group.fontColor).toBeUndefined();
  });
});
