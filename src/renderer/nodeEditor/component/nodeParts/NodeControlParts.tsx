import { cva } from "class-variance-authority";
import type { VariantProps } from "class-variance-authority";


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

const wrapperStyles = cva("grid w-full px-3 py-0.5", {
  variants: {
    cols: {
      1: "grid-cols-1 grid-cols-subgrid",
      2: "grid-cols-2 gap-x-2 items-center"
    }
  },
  defaultVariants: { cols: 1 }
});

export type ControlWrapperProps = VariantProps<typeof wrapperStyles> & React.ComponentProps<"div">;
export function ControlWrapper({ cols, className, ...props }: ControlWrapperProps) {
  return <div className={wrapperStyles({ cols, className })} {...props} />;
}

const labelStyles = cva("cursor-pointer", {
  variants: {
    type: {
      input: "w-full truncate text-xs mb-1.5",
      checkbox: "text-xs mr-2 select-none"
    }
  },
  defaultVariants: { type: "input" }
});

export type ControlLabelProps = VariantProps<typeof labelStyles> & React.ComponentProps<"label">;
export function ControlLabel({ type, htmlFor, className, children, ...props }: ControlLabelProps) {
  return (
    <label htmlFor={htmlFor} className={labelStyles({ type, className })} {...props}>
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
  ["h-4 rounded opacity-90 bg-gray-100 border-input accent-gray-100 hover:accent-gray-300"],
  {
    variants: {
      editable: {
        true: "",
        false: "cursor-not-allowed opacity-50",
      }
    }
  }
);
