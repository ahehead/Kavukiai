import { Type, type TSchema } from "@sinclair/typebox";

const TEMPLATE_PLACEHOLDER_PATTERN = /{{\s*([^{}]+?)\s*}}/g;

type TemplateContext = Record<string, unknown>;

function isTemplateContext(value: unknown): value is TemplateContext {
  return typeof value === "object" && value !== null;
}

export function parseTemplatePlaceholders(template: unknown): string[] {
  if (typeof template !== "string" || template.length === 0) {
    return [];
  }

  const placeholders = new Set<string>();
  for (const match of template.matchAll(TEMPLATE_PLACEHOLDER_PATTERN)) {
    const rawKey = match[1];
    if (typeof rawKey !== "string") continue;

    const key = rawKey.trim();
    if (key.length === 0) continue;
    placeholders.add(key);
  }

  return [...placeholders].sort();
}

export function buildTemplateSchema(placeholders: Iterable<string>): TSchema {
  const schemaEntries: Record<string, TSchema> = {};
  const uniqueKeys = Array.from(placeholders)
    .map((key) => key.trim())
    .filter((key) => key.length > 0);

  uniqueKeys.sort();

  for (const key of uniqueKeys) {
    schemaEntries[key] = Type.String();
  }

  return Type.Object(schemaEntries);
}

export function evaluateTemplate(
  template: unknown,
  data: unknown
): { result: string; missingKeys: string[] } {
  const tpl = typeof template === "string" ? template : "";
  const context = isTemplateContext(data) ? (data as TemplateContext) : {};
  const missingKeys = new Set<string>();

  const result = tpl.replace(
    TEMPLATE_PLACEHOLDER_PATTERN,
    (_match, rawKey: string) => {
      const key = rawKey?.trim();
      if (!key) {
        return "";
      }

      if (key in context) {
        const value = context[key];
        return value !== undefined ? String(value) : "";
      }

      missingKeys.add(key);
      return "";
    }
  );

  return { result, missingKeys: [...missingKeys].sort() };
}
