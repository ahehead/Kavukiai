type Loader<TModule> = () => Promise<TModule>;

type ModuleMap<TModule> = Record<string, TModule | Loader<TModule>>;

// Vite glob loaders expose functions named after the source path or __vite_glob_* helpers.
const MODULE_LOADER_NAME_PATTERN = /[\\/]/;
// These substrings appear in loader function bodies across Vite build targets.
const MODULE_LOADER_SOURCE_HINTS = [
  "__vite_ssr_dynamic_import__",
  "__vite_glob_",
  "import(",
] as const;

const hasLoaderSignature = (fn: (...args: unknown[]) => unknown) => {
  if (fn.name && (MODULE_LOADER_NAME_PATTERN.test(fn.name) || fn.name.startsWith("__vite_glob_"))) {
    return true;
  }

  const source = Function.prototype.toString.call(fn);
  return MODULE_LOADER_SOURCE_HINTS.some((hint) => source.includes(hint));
};

function isModuleLoader<TModule>(
  entry: TModule | Loader<TModule>
): entry is Loader<TModule> {
  if (typeof entry !== "function") {
    return false;
  }

  return hasLoaderSignature(entry as (...args: unknown[]) => unknown);
}

export interface LoadModulesOptions<TModule, TResult = TModule> {
  /**
   * Resolve the value to collect from each module.
   * Use this when modules expose registration functions through named/default exports.
   */
  resolve?: (module: TModule, path: string) => TResult | Promise<TResult>;
  /**
   * Hook invoked after each module is resolved.
   */
  onLoad?: (module: TResult, path: string) => void | Promise<void>;
}

/**
 * Normalises eager and lazy module maps produced by import.meta.glob.
 */
export async function loadModules<TModule, TResult = TModule>(
  modules: ModuleMap<TModule>,
  options: LoadModulesOptions<TModule, TResult> = {}
): Promise<TResult[]> {
  const { resolve, onLoad } = options;
  const results: TResult[] = [];

  for (const [path, entry] of Object.entries(modules)) {
    const moduleValue = isModuleLoader(entry) ? await entry() : entry;

    const resolvedValue = resolve
      ? await resolve(moduleValue, path)
      : ((moduleValue as unknown) as TResult);

    if (onLoad) {
      await onLoad(resolvedValue, path);
    }
    results.push(resolvedValue);
  }

  return results;
}
