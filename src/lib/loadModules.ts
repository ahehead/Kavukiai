type Loader<TModule> = () => Promise<TModule>;

type ModuleMap<TModule> = Record<string, TModule | Loader<TModule>>;

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
    const moduleValue =
      typeof entry === "function"
        ? await (entry as Loader<TModule>)()
        : entry;

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
