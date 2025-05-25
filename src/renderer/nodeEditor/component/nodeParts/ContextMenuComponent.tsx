import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "renderer/lib/utils"
import { ChevronRight, Search } from "lucide-react";
import { Drag } from "rete-react-plugin";

const menuStyle = cva(
  [
    "bg-background",
    "text-foreground",
    "rounded-md",
    "shadow-lg",
    "p-1",
    "min-w-[220px]",
    "ring-1",
    "ring-border/5",
    "opacity-97",
  ]
)

export function Menu({ className, ...props }: React.ComponentProps<"div"> & VariantProps<typeof menuStyle>) {
  return (
    <Drag.NoDrag>
      <div
        data-testid="context-menu"
        className={cn(menuStyle(), className)}
        {...props}
      />
    </Drag.NoDrag>
  )
}

const menuItemLayoutStyle = cva(
  [
    "relative",
    "group",
  ]
)

export function MenuItemLayout({ className, children, ...props }: React.ComponentProps<"div"> & VariantProps<typeof menuItemLayoutStyle>) {
  return (
    <div className={cn(menuItemLayoutStyle(), className)} {...props}>
      {children}
    </div>
  )
}

const subMenuLayoutStyle = cva(
  [
    "absolute",
    "top-[-1px]", // 親アイテムの Menu の padding (p-1) を考慮した位置
    "z-10",
    // "hidden", // opacity と visibility で制御するため不要に
    // "group-hover:block", // opacity と visibility で制御するため不要に
    // ホバー対策: 左に4px食い込ませ、その分パディングで内側のコンテンツを右にずらす
    "left-[calc(100%-4px)]",
    "pl-[4px]",
    "transition-opacity", // opacityのトランジションを有効化
    "duration-100",     // トランジションの期間を100msに設定
    "opacity-0",        // デフォルトは非表示（透明）
    "invisible",        // デフォルトは非表示（領域も確保しない）
    "pointer-events-none", // デフォルトは操作不可
    "group-hover:opacity-100", // groupホバー時に表示（不透明）
    "group-hover:visible",     // groupホバー時に表示（領域を確保）
    "group-hover:pointer-events-auto", // groupホバー時に操作可能
    "group-hover:delay-50",     // groupホバー時の表示遅延を50msに設定
    "delay-150" // groupホバーが外れた時の非表示遅延を300msに設定 (例として少し延長)
  ]
)

export function SubMenuLayout({ className, children, style, ...props }: React.ComponentProps<"div"> & VariantProps<typeof subMenuLayoutStyle> & { style?: React.CSSProperties }) {
  return (
    <div className={cn(subMenuLayoutStyle(), className)} style={style} {...props}>
      {children}
    </div>
  )
}

const menuItemStyle = cva(
  [
    "flex",
    "items-center",
    "justify-between",
    "text-sm",
    "py-1 px-2",
    "pl-8",
    "rounded-sm",
    "cursor-pointer",
    "hover:bg-accent/25",
    "hover:text-accent-foreground",
    "focus:outline-none",
    "focus:bg-accent/25",
    "focus:text-accent-foreground",
    "data-[disabled]:opacity-50",
    "data-[disabled]:pointer-events-none",
    "relative",
    "transition-colors",
  ]
)

export function MenuItemComponent({
  className,
  hasSubitems,
  children,
  disabled,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof menuItemStyle> & { hasSubitems?: boolean, disabled?: boolean }) {
  return (
    <div
      data-testid="context-menu-item"
      className={cn(menuItemStyle(), className)}
      data-disabled={disabled ? "" : undefined}
      {...props}
    >
      {children}
      {hasSubitems && <ChevronRight className="h-4 w-4 ml-auto" />}
    </div>
  )
}

const menuSearchStyle = cva(
  [
    "flex",
    "items-center",
    "gap-2",
    "w-full",
    "p-2",
    "mb-1",
    "text-sm",
    "bg-background",
    "border",
    "border-input",
    "rounded-sm",
    "focus-within:ring-1",
    "focus-within:ring-ring",
  ]
)

export function MenuSearchComponent({
  className,
  value,
  onChange,
  ...props
}: React.ComponentProps<"input"> &
  VariantProps<typeof menuSearchStyle> & {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  }) {
  return (
    <div className={cn(menuSearchStyle(), className)}>
      <Search className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
      <input
        data-testid="context-menu-search-input"
        className="w-full bg-transparent outline-none"
        placeholder="検索..."
        value={value}
        onChange={onChange}
        {...props}
      />
    </div>
  )
}

const menuSeparatorStyle = cva(
  [
    "my-1",
    "h-px",
    "bg-border",
  ]
)

export function MenuSeparator({ className, ...props }: React.ComponentProps<"div"> & VariantProps<typeof menuSeparatorStyle>) {
  return (
    <div
      className={cn(menuSeparatorStyle(), className)}
      {...props}
    />
  )
}
