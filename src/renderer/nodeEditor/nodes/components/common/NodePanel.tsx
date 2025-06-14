import { cn } from "renderer/lib/utils"
import { cva, type VariantProps } from "class-variance-authority";

import { Loader2 } from 'lucide-react';
import React from "react";

export const nodePanel = cva(
  ["bg-node-bg text-node-fg grid grid-cols-1 grid-rows-[auto_1fr] rounded-md border border-node-outline shadow-sm"],
  {
    variants: {
      selected: {
        true: ["ring-2 ring-node-primary/60"],
        false: ["hover:ring-2 hover:ring-accent/70"],
      },
      status: {
        IDLE: "",
        RUNNING: "border-node-running border-2 pulse-border hover:ring-node-running/70",
        COMPLETED: "border-node-success/70",
        ERROR: "bg-node-error/90 border-node-error/70",
        WARNING: "bg-node-warning border-node-warning/70",
      },
    },
    defaultVariants: {
      selected: false,
      status: "IDLE",
    },
  }
)

export const NodeContainer = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & VariantProps<typeof nodePanel>
>(({ selected, status, ...props }, ref) => (
  <div
    ref={ref}
    data-testid="node"
    data-status={status}
    className={cn(nodePanel({ selected, status }))}
    {...props}
  />
))
NodeContainer.displayName = "NodeContainer"

const nodeHeaderStyles = cva(
  ["rounded-t-md"],
  {
    variants: {
      status: {
        IDLE: "bg-gradient-to-r from-node-header/90 to-node-header",
        RUNNING: "bg-gradient-to-r from-node-header/90 to-node-running",
        COMPLETED: "bg-gradient-to-r from-node-header/90 to-node-header",
        ERROR: "bg-gradient-to-r from-node-header/90 to-node-header",
        WARNING: "bg-gradient-to-r from-node-header/90 to-node-header",
      }
    },
    defaultVariants: {
      status: "IDLE",
    }
  }
)

export function NodeHeader({ status, ...props }: React.ComponentProps<"div"> & VariantProps<typeof nodeHeaderStyles>) {
  return (
    <div
      className={cn(nodeHeaderStyles({ status }))}
      {...props}
    />
  )
}

const nodeTitleStyles = cva(
  ["node-title-size leading-none pl-2 py-2 tracking-tight font-semibold inline-block max-w-full truncate"],
  {
    variants: {
      status: {
        IDLE: "",
        RUNNING: "",
        COMPLETED: "",
        ERROR: "",
        WARNING: "",
      }
    },
    defaultVariants: {
      status: "IDLE",
    }
  }
)

export function NodeTitle({ status, children, ...props }: React.ComponentProps<"div"> & VariantProps<typeof nodeTitleStyles>) {
  return (
    <div
      data-testid="title"
      className={cn(nodeTitleStyles({ status }))}
      {...props}
    >
      {status === "RUNNING" && <Loader2 className="inline animate-spin mr-1 h-4 w-4" />}
      {children}
    </div>
  )
}

export function NodeBody({ ...props }: React.ComponentProps<"div">) {
  return (
    <div className='grid grid-rows-[auto_minmax(0,1fr)] ' {...props} />
  )
}

export function NodeControlsWrapper({ ...props }: React.ComponentProps<"div">) {
  return (
    <div className='grid grid-cols-1 place-items-stretch p-2 empty:p-0 empty:hidden' {...props} />
  )
}


