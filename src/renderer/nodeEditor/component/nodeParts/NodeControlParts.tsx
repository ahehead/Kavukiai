import { cva } from "class-variance-authority";
import type { VariantProps } from "class-variance-authority";
import { cn } from "renderer/lib/utils"

export const textAreaStyles = cva(
  ["w-full h-full py-2 px-2.5 resize-none border-none rounded-md"],
  {
    variants: {
      editable: {
        true: "ring-1 ring-input focus:ring-2 focus:ring-accent",
        false: "bg-gray-100 ring-0 focus:ring-0 outline-none focus:outline-none",
      },
    },
    defaultVariants: {
      editable: true,
    },
  }
);

const wrapperStyles = cva("grid items-center w-full px-3 py-[0.2em]", {
  variants: {
    cols: {
      1: "grid-cols-1 grid-cols-subgrid",
      2: "grid-cols-2 gap-x-2"
    }
  },
  defaultVariants: { cols: 1 }
});

export type ControlWrapperProps = VariantProps<typeof wrapperStyles> & React.ComponentProps<"div">;
export function ControlWrapper({ cols, className, ...props }: ControlWrapperProps) {
  return <div className={cn(wrapperStyles({ cols }), className)} {...props} />;
}

const labelStyles = cva("cursor-pointer min-w-0 truncate", {
  variants: {
    cols: {
      0: "",
      1: "mb-1.5",
      2: "",
    }
  },
  defaultVariants: { cols: 1 }
});

export type ControlLabelProps = VariantProps<typeof labelStyles> & React.ComponentProps<"label">;
export function ControlLabel({ cols, htmlFor, className, children, ...props }: ControlLabelProps) {
  return (
    <label
      htmlFor={htmlFor}
      className={cn(labelStyles({ cols }), className)}
      {...props}>
      {children}
    </label>
  );
}

export const inputValueStyles = cva(
  ["w-full min-w-0 rounded-full border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"],
  {
    variants: {
      editable: {
        true: "",
        false: "bg-gray-100 cursor-not-allowed",
      }
    }
  }
);

export const checkBoxStyles = cva(
  ["w-[18px] h-[18px] rounded opacity-90 bg-gray-100 border-input accent-gray-100 hover:accent-gray-300"],
  {
    variants: {
      editable: {
        true: "",
        false: "cursor-not-allowed opacity-50",
      }
    }
  }
);

