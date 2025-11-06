import { loadModules } from "src/lib/loadModules";
import { describe, expect, test, vi } from "vitest";
import { registerLog } from "./__fixtures__/register/registerLog";

type FixtureModule = { register: () => string } | { default: () => string };

const resolveRegister = (module: FixtureModule) => {
  if ("register" in module) {
    return module.register();
  }

  if ("default" in module) {
    return module.default();
  }

  throw new Error("register export not found");
};

describe("loadModules", () => {
  test("normalises eager module maps", async () => {
    const hitPaths: string[] = [];
    const modules = import.meta.glob<FixtureModule>(
      "./__fixtures__/module*.ts",
      {
        eager: true,
      }
    );
    const results = await loadModules(modules, {
      resolve: (module, path) => {
        hitPaths.push(path);
        return resolveRegister(module);
      },
    });

    expect(results.sort()).toEqual(["moduleA", "moduleB"]);
    expect(hitPaths.sort()).toEqual(
      ["./__fixtures__/moduleA.ts", "./__fixtures__/moduleB.ts"].sort()
    );
  });

  test("returns eager register exports without invoking them", async () => {
    registerLog.length = 0;

    const modules = import.meta.glob<() => string>(
      "./__fixtures__/register/register[A-B].ts",
      {
        eager: true,
        import: "register",
      }
    );

    const registerFns = Object.values(modules);
    const results = await loadModules(modules);

    expect(registerLog).toEqual([]);
    expect(results).toEqual(registerFns);

    results.forEach((register) => {
      register();
    });
    expect(registerLog.sort()).toEqual(["A", "B"]);
  });

  test("awaits lazy module loaders and onLoad hooks", async () => {
    const onLoad = vi.fn(async () => {
      await Promise.resolve();
    });

    const modules = import.meta.glob<FixtureModule>(
      "./__fixtures__/module*.ts"
    );

    const results = await loadModules(modules, {
      resolve: resolveRegister,
      onLoad,
    });

    expect(results.sort()).toEqual(["moduleA", "moduleB"]);
    expect(onLoad).toHaveBeenCalledTimes(2);
  });
});
