import { expect, test } from "vitest";
import { createUISettings } from "@shared/AppType";

test("test", () => {
  expect(createUISettings()).toBeDefined();
});
