
import React from "react";
import { cva } from "class-variance-authority";
import { computeSubmenuOffset } from "./menuPosition";

const menuContainer = cva("bg-node-bg shadow-lg text-sm grid grid-cols-1 border border-node-border/20 rounded-md");

export function MenuContainer({
  children,
  width,
  ...props
}: {
  children: React.ReactNode;
  width: number;
} & React.ComponentProps<"div">) {
  return (
    <div
      data-testid="context-menu"
      className={menuContainer()}
      style={{ minWidth: width, width: "fit-content" }}
      {...props}
    >
      {children}
    </div>
  );
}
const menuItem = cva(
  "grid grid-cols-6 gap-1 hover:bg-accent/60 px-1 relative transition-colors duration-290 delay-50 py-1.25"
);

export const MenuItemContainer = React.forwardRef<HTMLDivElement, React.ComponentProps<"div">>(
  ({ children, ...props }, ref) => {
    return (
      <div
        data-testid="context-menu-item"
        className={menuItem()}
        ref={ref}
        {...props}
      >
        {children}
      </div>
    );
  }
);

const submenuContainer = cva("absolute top-0");

export function SubmenuWrapper({
  children,
  side,
  width,
  anchorRect,
  itemHeight,
  itemCount,
  ...props
}: {
  children: React.ReactNode;
  side: "right" | "left";
  width: number;
  anchorRect: DOMRect | null;
  itemHeight: number;
  itemCount: number;
} & React.ComponentProps<"div">) {
  const [offset, setOffset] = React.useState(0);

  React.useLayoutEffect(() => {
    if (!anchorRect) return;
    const editorHeight = window.innerHeight;
    const submenuHeight = itemHeight * itemCount;
    const off = computeSubmenuOffset(anchorRect.top, submenuHeight, editorHeight);
    setOffset(off);
  }, [anchorRect, itemHeight, itemCount]);

  return (
    <div
      className={submenuContainer()}
      style={{
        top: offset,
        ...(side === "right" ? { left: width } : { right: width })
      }}
      {...props}
    >
      {children}
    </div>
  );
}
