import { expect, test } from "vitest";
import {
  createUISettings,
  createApiKeys,
  createApiKeysSave,
  providers,
} from "@shared/AppType";

test("test", () => {
  expect(createUISettings()).toBeDefined();
});

test("createApiKeys returns flags for all providers set to false", () => {
  const keys = createApiKeys();
  expect(Object.keys(keys)).toEqual(providers);
  for (const p of providers) {
    expect(keys[p]).toBe(false);
  }
});

test("createApiKeysSave returns flags for all providers set to null", () => {
  const keysSave = createApiKeysSave();
  expect(Object.keys(keysSave)).toEqual(providers);
  for (const p of providers) {
    expect(keysSave[p]).toBeNull();
  }
});
