import { cva } from "class-variance-authority";
import { Scope, type BaseSchemes, type Root } from "rete";
import { type Area2D, type BaseArea, BaseAreaPlugin } from "rete-area-plugin";

export class GridLineSnapPlugin<Schemes extends BaseSchemes> extends Scope<
  BaseAreaPlugin<Schemes, BaseArea<Schemes>>,
  [Area2D<Schemes>, Root<Schemes>]
> {
  private area!: BaseAreaPlugin<Schemes, BaseArea<Schemes>>;
  private baseSize: number;
  private snapEnabled: boolean;
  private gridColor: string;
  private backgroundElem!: HTMLDivElement;
  private lastZoom = 1;
  private gridOpacity: number;

  constructor(options?: {
    baseSize?: number;
    snap?: boolean;
    gridColor?: string;
    gridOpacity?: number;
  }) {
    super("gridline-snap-plugin");
    this.baseSize = options?.baseSize ?? 10;
    this.snapEnabled = options?.snap ?? true;
    this.gridColor = options?.gridColor ?? "#e5e7eb";
    this.gridOpacity = options?.gridOpacity ?? 0.35;
  }

  setParent(scope: Scope<BaseArea<Schemes>, [Root<Schemes>]>) {
    super.setParent(scope);

    this.area =
      this.parentScope<BaseAreaPlugin<Schemes, BaseArea<Schemes>>>(
        BaseAreaPlugin
      );

    const container: HTMLElement = (this.area as any).container;

    if (!container || !(container instanceof HTMLElement))
      throw new Error("container expected");

    const background = document.createElement("div");

    // Tailwind クラスで位置・サイズ・白背景 + 最背面化
    const bgStyles = cva(
      "absolute top-[-320000px] left-[-320000px] w-[640000px] h-[640000px] bg-background z-[-1]"
    );
    background.className = bgStyles();

    this.backgroundElem = background;
    container.childNodes[0].appendChild(background);
    this.applyStyle();

    this.addPipe((context) => {
      if (!context || !(typeof context === "object" && "type" in context))
        return context;

      // zoomの変更時にグリッド線のサイズを変更
      if (context.type === "zoomed") {
        const { zoom } = context.data;
        this.lastZoom = zoom;
        this.applyStyle();
      }

      // ノードの移動後、グリッド幅にスナップ
      if (context.type === "nodedragged" && this.snapEnabled) {
        const { id } = context.data;
        const node = this.area.nodeViews.get(id);
        if (!node) return context;
        const nextPosition = {
          x: Math.round(node.position.x / this.baseSize) * this.baseSize,
          y: Math.round(node.position.y / this.baseSize) * this.baseSize,
        };
        void this.area.translate(id, nextPosition);
      }
      return context;
    });
  }

  private colorWithAlpha(color: string, alpha: number) {
    // #RRGGBB → rgba()
    if (color.startsWith("#")) {
      const hex = color.slice(1);
      const bigint = Number.parseInt(hex, 16);
      const r = (bigint >> 16) & 255;
      const g = (bigint >> 8) & 255;
      const b = bigint & 255;
      return `rgba(${r},${g},${b},${alpha})`;
    }

    // 既に rgb() → rgba() へ置換
    if (color.startsWith("rgb(")) {
      return color.replace("rgb(", "rgba(").replace(")", `,${alpha})`);
    }

    // hsl() や既に α が入っている場合はそのまま返す
    return color;
  }

  private applyStyle() {
    const scaleFactor = 1 / this.lastZoom;
    const multiplier = Math.max(1, Math.floor(scaleFactor));
    const gridSize = this.baseSize * multiplier;
    const lineSize = multiplier;
    const lineColor = this.colorWithAlpha(this.gridColor, this.gridOpacity);

    this.backgroundElem.style.backgroundImage = `
    linear-gradient(${lineColor} ${lineSize}px, transparent ${lineSize}px),
    linear-gradient(90deg, ${lineColor} ${lineSize}px, transparent ${lineSize}px)
  `;
    this.backgroundElem.style.backgroundSize = `${gridSize}px ${gridSize}px`;
  }

  public setBaseSize(size: number) {
    this.baseSize = size;
    this.applyStyle();
  }
  public setSnapEnabled(enabled: boolean) {
    this.snapEnabled = enabled;
  }
  public setGridColor(color: string) {
    this.gridColor = color;
    this.applyStyle();
  }
  public refresh() {
    this.applyStyle();
  }
  public setGridOpacity(alpha: number) {
    this.gridOpacity = Math.min(1, Math.max(0, alpha)); // 0-1 clamp
    this.applyStyle();
  }
}
