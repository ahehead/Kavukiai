import { cva } from "class-variance-authority";


export const textAreaStyles = cva(
  ["w-full h-full py-2 px-2.5 resize-none border-none rounded-md"],
  {
    variants: {
      editable: {
        true: " ring-1 ring-input focus:ring-2 focus:ring-accent",
        false: " bg-gray-100 ring-0 focus:ring-0 outline-none focus:outline-none",
      },
    },
    defaultVariants: {
      editable: true,
    },
  }
);

export function InputControlWrapper({ ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={"grid grid-cols-1 w-full"}
      {...props} />
  );
}

export const inputControlLabelStyles = cva(
  "block w-full truncate text-xs text-gray-500 mb-1.5"
);

export function InputControlLabel({ children, ...props }: React.ComponentProps<"label">) {
  // biome-ignore lint/a11y/noLabelWithoutControl: <explanation>
  return <label {...props} className={inputControlLabelStyles()}>{children}</label>;
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

export function CheckBoxWrapper({ ...props }: React.ComponentProps<"div">) {
  return (
    <div className="grid auto-cols-max grid-flow-col gap-x-2 items-center" {...props} />
  );
}


export function CheckBoxLabel({ ...props }: React.ComponentProps<"label">) {
  return (
    // biome-ignore lint/a11y/noLabelWithoutControl: <explanation>
    <label
      className="text-xs text-gray-500 mr-2 cursor-pointer select-none"
      {...props} />
  );
}

export const checkBoxStyles = cva(
  ["h-4 w-4 rounded opacity-90 bg-gray-100 border-input accent-gray-100 hover:accent-gray-300"],
  {
    variants: {
      editable: {
        true: "",
        false: "cursor-not-allowed opacity-50",
      }
    }
  }
);
