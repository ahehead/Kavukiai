import { cn } from "renderer/lib/utils"
import { cva, type VariantProps } from "class-variance-authority";

export const nodePanelValiant = cva(
  ["bg-node text-node-fg flex flex-col rounded-md border shadow-sm"],
  {
    variants: {
      selected: {
        true: ["border-node-selected"],
        false: null,
      }
    },
    defaultVariants: {
      selected: false,
    },
  }
)

export function NodePanel({ selected, ...props }: React.ComponentProps<"div"> & VariantProps<typeof nodePanelValiant>) {
  return (
    <div
      className={cn(
        nodePanelValiant({ selected }),
      )}
      {...props}
    />
  )
}

export function NodePanelHeader({ ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("bg-node-header")}
      {...props}
    />
  )
}

export function NodeTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("leading-none font-semibold", className)}
      {...props}
    />
  )
}
