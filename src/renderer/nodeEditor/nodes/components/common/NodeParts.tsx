import { cn } from "renderer/lib/utils"
import { cva, type VariantProps } from "class-variance-authority";

import { Loader2, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import React, { useRef } from "react";
import { Drag } from "rete-react-plugin";
import { useStopWheel } from "../../util/useStopWheel";
import { NodeStatus } from "renderer/nodeEditor/types";

export const nodeContainer = cva(
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
  React.ComponentProps<"div"> & VariantProps<typeof nodeContainer> & { nodeType?: string }
>(({ selected, status, nodeType, ...props }, ref) => (
  <div
    ref={ref}
    data-testid="node"
    data-status={status}
    data-node-type={nodeType}
    className={cn(nodeContainer({ selected, status }))}
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

export function NodeHeader({ status, nodeType, ...props }: React.ComponentProps<"div"> & VariantProps<typeof nodeHeaderStyles> & { nodeType?: string }) {
  return (
    <div
      data-status={status}
      data-node-type={nodeType}
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
  const icon = (() => {
    switch (status) {
      case NodeStatus.RUNNING:
        return <Loader2 className="inline animate-spin mr-1 h-4 w-4" />
      case NodeStatus.COMPLETED:
        return <CheckCircle className="inline mr-1 h-4 w-4" />
      case NodeStatus.ERROR:
        return <XCircle className="inline mr-1 h-4 w-4" />
      case NodeStatus.WARNING:
        return <AlertTriangle className="inline mr-1 h-4 w-4" />
      default:
        return null
    }
  })()

  return (
    <div
      data-testid="title"
      data-status={status}
      className={cn(nodeTitleStyles({ status }))}
      {...props}
    >
      {icon}
      {children}
    </div>
  )
}

export function NodeBody({ ...props }: React.ComponentProps<"div">) {
  return (
    <div className='grid grid-rows-[auto_minmax(0,1fr)] overflow-hidden' {...props} />
  )
}

export function NodeControlsWrapper({ ...props }: React.ComponentProps<"div">) {
  const ref = useRef<HTMLDivElement | null>(null);
  Drag.useNoDrag(ref);
  useStopWheel(ref);
  return (
    <div
      ref={ref}
      className='grid grid-cols-1 place-items-stretch p-2 empty:p-0 empty:hidden min-h-0 overflow-hidden' {...props} />
  )
}


