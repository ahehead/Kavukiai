import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "renderer/lib/utils"
import { ChevronRight, Search } from "lucide-react";
import { Drag } from "rete-react-plugin";

export type ItemType = {
  label: string;
  key: string;
  handler: () => void;
  subitems?: ItemType[];
  disabled?: boolean;
  icon?: React.ReactNode;
}

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
    "opacity-90",
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
    "hover:bg-accent/20", // アクセントカラーを薄くする
    "hover:text-accent-foreground",
    "focus:outline-none",
    "focus:bg-accent/20", // アクセントカラーを薄くする
    "focus:text-accent-foreground",
    "data-[disabled]:opacity-50",
    "data-[disabled]:pointer-events-none",
    "relative",
    "transition-colors", // 色の変化をスムーズにする
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
