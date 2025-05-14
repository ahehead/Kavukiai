import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "renderer/lib/utils";
import { Button, buttonVariants } from "./ui/button";
import { Bell, BellPlus, Circle, Plus, X } from "lucide-react";

export const iconButtonStyles = cva("flex-shrink-0 rounded-md cursor-pointer bg-transparent focus:outline-none forcus-visible:outline-none", {
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




export function UIButton({ ...props }: React.ComponentProps<"button"> & VariantProps<typeof iconButtonStyles>) {
  return (
    <Button className={cn(buttonVariants({ variant: "ghost", size: "icon" }), iconButtonStyles())} {...props} />
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

const menuButtonStyles = cva("flex-shrink-0 rounded-md cursor-pointer bg-transparent focus:outline-none forcus-visible:outline-none")

export function MenuButton({ ...props }: React.ComponentProps<"button">) {
  return (
    <UIButton className={cn(buttonVariants({ variant: "ghost" }), menuButtonStyles())} {...props} />
  )
}

export function BellButton({ haveUnread, ...props }: { haveUnread: boolean } & React.ComponentProps<"button">) {
  return (
    <Button className={cn(buttonVariants({ variant: "outline" }), iconButtonStyles({ outLineSize: "lg", variant: "outline" }))} {...props}>
      {haveUnread ?
        <BellPlus className="icon-size-md" />
        : <Bell className="icon-size-md" />}
    </Button>
  )
}
