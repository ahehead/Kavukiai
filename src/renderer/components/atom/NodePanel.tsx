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
      data-testid="node"
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
      className={cn("bg-node-header rounded-t-md")}
      {...props}
    />
  )
}

export function NodeTitle({ ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-testid="title"
      className={cn(["leading-none font-semibold pl-2 py-2"])}
      {...props}
    />
  )
}

export function NodePanelBody({ ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("flex flex-col pt-1 gap-1")}
      {...props}
    />
  )
}
