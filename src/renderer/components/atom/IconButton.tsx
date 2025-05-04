import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "renderer/lib/utils";

export const iconButtonVariants = cva("flex-shrink-0 w-6 h-6 flex items-center justify-center hover:bg-foreground/10 rounded-md cursor-pointer bg-transparent focus:outline-none")


export function UIButton({ ...props }: React.ComponentProps<"button"> & VariantProps<typeof iconButtonVariants>) {
  return (
    <button className={cn(iconButtonVariants())} {...props} />
  )
}
