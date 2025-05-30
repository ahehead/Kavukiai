
import { cva } from "class-variance-authority";

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
      style={{ width }}
      {...props}
    >
      {children}
    </div>
  );
}
const menuItem = cva(
  "grid grid-cols-6 gap-1 hover:bg-accent/60 px-1 relative transition-colors duration-290 delay-50 py-1.25"
);

export function MenuItemContainer({
  children,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-testid="context-menu-item"
      className={menuItem()}
      {...props}
    >
      {children}
    </div>
  );
}

const submenuContainer = cva("absolute top-0");

export function SubmenuWrapper({
  children,
  side,
  width,
  ...props
}: {
  children: React.ReactNode;
  side: "right" | "left";
  width: number;
} & React.ComponentProps<"div">) {

  return (
    <div
      className={submenuContainer()}
      style={
        side === "right"
          ? { left: width }
          : { right: width }}
      {...props}
    >
      {children}
    </div>
  );
}
