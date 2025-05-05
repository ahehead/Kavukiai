import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "renderer/lib/utils";
import { Button, buttonVariants } from "../ui/button";
import { Circle, Plus, X } from "lucide-react";

export const iconButtonVariants = cva("flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-md cursor-pointer bg-transparent focus:outline-none forcus-visible:ounline-none shadow-none")


export function UIButton({ ...props }: React.ComponentProps<"button"> & VariantProps<typeof iconButtonVariants>) {
  return (
    <Button className={cn(buttonVariants({ variant: "ghost" }), iconButtonVariants())} {...props} />
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
