import { expect, test } from "vitest";
import {
  createApiKeysFlags,
  createApiKeysSecrets,
  createUISettings,
  providers,
} from "@shared/AppType";

test("test", () => {
  expect(createUISettings()).toBeDefined();
});

test("createApiKeysFlags returns flags for all providers set to false", () => {
  const keys = createApiKeysFlags();
  expect(Object.keys(keys)).toEqual(providers);
  for (const p of providers) {
    expect(keys[p]).toBe(false);
  }
});

test("createApiKeysSecrets returns flags for all providers set to null", () => {
  const keysSave = createApiKeysSecrets();
  expect(Object.keys(keysSave)).toEqual(providers);
  for (const p of providers) {
    expect(keysSave[p]).toBeNull();
  }
});
