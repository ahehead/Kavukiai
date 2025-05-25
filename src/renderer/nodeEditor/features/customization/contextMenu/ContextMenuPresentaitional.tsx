
import { cva } from "class-variance-authority";

const menuContainer = cva("bg-node-bg shadow-lg text-sm");
const menuItem = cva(
  "bg-node-bg hover:bg-accent/60 px-1 relative transition-colors duration-290 delay-50"
);
const submenuContainer = cva("absolute top-0");

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
