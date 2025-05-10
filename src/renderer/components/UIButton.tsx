import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "renderer/lib/utils";
import { Button, buttonVariants } from "./ui/button";
import { Bell, BellPlus, Circle, Plus, X } from "lucide-react";

export const iconButtonVariants = cva("flex-shrink-0 rounded-md cursor-pointer bg-transparent focus:outline-none forcus-visible:outline-none", {
  variants: {
    variant: {
      default: "shadow-none",
      outline: "rounded-full bg-background",
    },
    outLineSize: {
      md: "w-6 h-6",
      lg: "w-8 h-8",
    }
  },
  defaultVariants: {
    variant: "default",
    outLineSize: "md",
  }
})




export function UIButton({ ...props }: React.ComponentProps<"button"> & VariantProps<typeof iconButtonVariants>) {
  return (
    <Button className={cn(buttonVariants({ variant: "ghost", size: "icon" }), iconButtonVariants())} {...props} />
  )
}


export function PlusButton({ ...props }: React.ComponentProps<"button">) {
  return (
    <UIButton
      {...props}
    >
      <Plus className="icon-base-size" />
    </UIButton>
  )
}

export function CloseFileButton({ isDirty, ...props }: { isDirty: boolean } & React.ComponentProps<"button">) {
  return (
    <UIButton
      {...props}
    >
      {isDirty ? (
        <Circle className="close-icon-maru" />
      ) : (
        <X className="icon-base-size" />
      )}
    </UIButton>
  )
}

export function BellButton({ haveUnread, ...props }: { haveUnread: boolean } & React.ComponentProps<"button">) {
  return (
    <Button className={cn(buttonVariants({ variant: "outline" }), iconButtonVariants({ outLineSize: "lg", variant: "outline" }))} {...props}>
      {haveUnread ?
        <BellPlus className="icon-size-md" />
        : <Bell className="icon-size-md" />}
    </Button>
  )
}
