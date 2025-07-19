import { unescapeSeparator } from "renderer/nodeEditor/nodes/util/unescapeSeparator";
import { describe, expect, it } from "vitest";

describe("unescapeSeparator", () => {
  // [入力, 期待する出力]
  const cases: Array<[string, string]> = [
    ["\\n", "\n"],
    ["\\r\\n", "\r\n"],
    ["\\t", "\t"],
    ["foo\\nbar", "foo\nbar"],
    ["\\s", " "], // 任意でスペース展開する場合
    ["comma,", "comma,"], // 展開不要
    ["\\\\", "\\"], // 単一バックスラッシュ
  ];

  it.each(cases)('"%s" → "%s"', (input, expected) => {
    expect(unescapeSeparator(input)).toBe(expected);
  });

  it("invalid escape stays as‑is (e.g. \\x)", () => {
    expect(unescapeSeparator("\\x")).toBe("\\x");
  });
});
