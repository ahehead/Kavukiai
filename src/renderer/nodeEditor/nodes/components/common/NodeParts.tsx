import { cva, type VariantProps } from 'class-variance-authority'
import { AlertTriangle, CheckCircle, Circle, Loader2 } from 'lucide-react'
import React, { useRef } from 'react'
import { cn } from 'renderer/lib/utils'
import { NodeStatus } from 'renderer/nodeEditor/types'
import { Drag } from 'rete-react-plugin'
import { useStopWheel } from '../../util/useStopWheel'

export const nodeContainer = cva(
  [
    'bg-node-bg text-node-fg grid grid-cols-1 grid-rows-[auto_1fr] rounded-md border border-node-outline shadow-sm',
  ],
  {
    variants: {
      selected: {
        true: ['ring-2 ring-node-primary/60'],
        false: ['hover:ring-2 hover:ring-accent/70'],
      },
      status: {
        IDLE: '',
        RUNNING:
          'border-node-running border-2 pulse-border hover:ring-node-running/70',
        COMPLETED: 'border-node-success/70',
        ERROR: 'bg-node-error/90 border-node-error/70',
        WARNING: 'bg-node-warning border-node-warning/70',
      },
    },
    defaultVariants: {
      selected: false,
      status: 'IDLE',
    },
  }
)

export const NodeContainer = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'> &
  VariantProps<typeof nodeContainer> & { nodeType?: string }
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
NodeContainer.displayName = 'NodeContainer'

const nodeHeaderStyles = cva(['flex flex-row items-center rounded-t-md w-full'], {
  variants: {
    status: {
      IDLE: 'bg-gradient-to-r from-node-header/90 to-node-header',
      RUNNING: 'bg-gradient-to-r from-node-header/90 to-node-running',
      COMPLETED: 'bg-gradient-to-r from-node-header/90 to-node-header',
      ERROR: 'bg-gradient-to-r from-node-header/90 to-node-header',
      WARNING: 'bg-gradient-to-r from-node-header/90 to-node-header',
    },
  },
  defaultVariants: {
    status: 'IDLE',
  },
})

const iconStyle = cva(["h-[10px] w-[10px] inline-block"], {
  variants: {
    status: {
      IDLE: 'h-[9px] w-[9px] text-node-header-fg/50 fill-[var(--color-node-header-fg)]/50',
      RUNNING: 'animate-spin text-node-icon-running',
      COMPLETED: 'text-node-icon-success',
      ERROR: 'text-node-icon-error fill-[var(--color-node-icon-error)]',
      WARNING: 'text-node-icon-warning',
    },
  },
  defaultVariants: {
    status: 'IDLE',
  },
})

export function NodeHeader({
  status,
  nodeType,
  children,
  ...props
}: React.ComponentProps<'div'> &
  VariantProps<typeof nodeHeaderStyles> & { nodeType?: string }) {
  const icon = (() => {
    switch (status) {
      case NodeStatus.IDLE:
        return <Circle className={cn(iconStyle({ status }))} />
      case NodeStatus.RUNNING:
        return <Loader2 className={cn(iconStyle({ status }),)} />
      case NodeStatus.COMPLETED:
        return <CheckCircle className={cn(iconStyle({ status }))} />
      case NodeStatus.ERROR:
        return <Circle className={cn(iconStyle({ status }))} />
      case NodeStatus.WARNING:
        return <AlertTriangle className={cn(iconStyle({ status }))} />
      default:
        return null
    }
  })()
  return (
    <div
      data-status={status}
      data-node-type={nodeType}
      className={cn(nodeHeaderStyles({ status }))}
      {...props}
    >
      <div className='ml-1.5 mr-1.5 flex flex-row items-center justify-center'>{icon}</div>
      {children}
    </div>
  )
}

const nodeTitleStyles = cva(
  [
    'flex-1 node-title-size leading-none py-2 tracking-tight font-semibold inline-block max-w-full truncate',
  ],
  {
    variants: {
      status: {
        IDLE: '',
        RUNNING: '',
        COMPLETED: '',
        ERROR: '',
        WARNING: '',
      },
    },
    defaultVariants: {
      status: 'IDLE',
    },
  }
)

export function NodeTitle({
  status,
  children,
  ...props
}: React.ComponentProps<'div'> & VariantProps<typeof nodeTitleStyles>) {
  return (
    <div
      data-testid="title"
      data-status={status}
      className={cn(nodeTitleStyles({ status }))}
      {...props}
    >
      {children}
    </div>
  )
}

export function NodeBody({ ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className="grid grid-rows-[auto_minmax(0,1fr)] overflow-hidden"
      {...props}
    />
  )
}

export function NodeControlsWrapper({ ...props }: React.ComponentProps<'div'>) {
  const ref = useRef<HTMLDivElement | null>(null)
  Drag.useNoDrag(ref)
  useStopWheel(ref)
  return (
    <div
      ref={ref}
      className="flex flex-col h-full overflow-hidden gap-2 p-2 empty:p-0 empty:hidden min-h-0"
      {...props}
    />
  )
}
