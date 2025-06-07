import * as TooltipPrimitive from "@radix-ui/react-tooltip"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "renderer/lib/utils"


function TooltipProvider({
  delayDuration = 0,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Provider>) {
  return (
    <TooltipPrimitive.Provider
      data-slot="tooltip-provider"
      delayDuration={delayDuration}
      {...props}
    />
  )
}

function Tooltip({
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Root>) {
  return (
    <TooltipProvider>
      <TooltipPrimitive.Root data-slot="tooltip" {...props} />
    </TooltipProvider>
  )
}

function TooltipTrigger({
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Trigger>) {
  return <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props} />
}

const tooltipContentVariants = cva(
  "border text-node-fg animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 origin-(--radix-tooltip-content-transform-origin) rounded-md px-3 py-1.5 text-xs text-balance tooltip-scrollbar",
  {
    variants: {
      variant: {
        default: "bg-node-bg border-node-border",
        header: "bg-node-header-light border-node-border text-node-fg",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const tooltipArrowVariants = cva(
  "border-0 size-2.5 translate-y-[calc(-50%_-_1px)] rotate-45 rounded-br-[2px] z-40 border-node-border border-b border-r",
  {
    variants: {
      variant: {
        default: "bg-node-bg fill-node-bg",
        header: "bg-node-header-light fill-node-header-light",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)


function TooltipContent({
  className,
  sideOffset = 0,
  children,
  variant,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Content> &
  VariantProps<typeof tooltipContentVariants>) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        data-slot="tooltip-content"
        sideOffset={sideOffset}
        align="center"
        className={cn(tooltipContentVariants({ variant, class: className }))}
        {...props}
      >
        <div className="overflow-auto">{children}</div>
        <TooltipPrimitive.Arrow
          className={tooltipArrowVariants({ variant })}
        />
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  )
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }
