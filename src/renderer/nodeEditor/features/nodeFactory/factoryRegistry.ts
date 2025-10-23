import { factoryList } from "../../nodes/nodeFactories";
import type { FactoryMeta, FactoryWithMeta } from "./factoryTypes";

// ===== レジストリ: typeId(namespace:name) -> factory =======================
const registry = new Map<string, FactoryWithMeta>();

function normalizeMeta(meta: FactoryMeta): FactoryMeta {
  const categories = meta.categories ? [...meta.categories] : [];
  if (!meta.op) {
    throw new Error("FactoryMeta.op is required now");
  }
  const namespace = meta.namespace ?? "core";
  const typeId = `${namespace}:${meta.op}`;
  return { ...meta, categories, namespace, typeId };
}

function ensureRegistry() {
  if (registry.size) return;
  for (const fn of factoryList) {
    fn.meta = normalizeMeta(fn.meta);
    if (!fn.meta.typeId) {
      console.error(
        "Normalized meta missing typeId (should not happen)",
        fn.meta
      );
      continue;
    }
    if (registry.has(fn.meta.typeId)) {
      console.warn("Duplicate factory typeId detected:", fn.meta.typeId);
    }
    registry.set(fn.meta.typeId, fn as FactoryWithMeta);
  }
}

export function getFactoryByTypeId(id: string): FactoryWithMeta | undefined {
  ensureRegistry();
  return registry.get(id);
}

export function getRegisteredFactories(): FactoryWithMeta[] {
  ensureRegistry();
  return Array.from(registry.values());
}
