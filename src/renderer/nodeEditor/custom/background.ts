import type { BaseSchemes } from "rete";
import type { AreaPlugin } from "rete-area-plugin";

export function addCustomBackground<S extends BaseSchemes, K>(
  area: AreaPlugin<S, K>
): void {
  const background = document.createElement("div");

  // Tailwind クラスで位置・サイズ・白背景 + 最背面化
  background.className = [
    "absolute",
    "top-[-320000px]",
    "left-[-320000px]",
    "w-[640000px]",
    "h-[640000px]",
    "bg-white",
    "z-[-1]",
  ].join(" ");

  // 微細グリッド（10px 方眼）
  Object.assign(background.style, {
    backgroundImage: `
      linear-gradient(#e5e7eb 1px, transparent 1px),
      linear-gradient(90deg, #e5e7eb 1px, transparent 1px)
    `,
    backgroundSize: "10px 10px",
  });

  area.area.content.add(background);
}
