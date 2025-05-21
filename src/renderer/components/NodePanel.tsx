import { cn } from "renderer/lib/utils"
import { cva, type VariantProps } from "class-variance-authority";
import TriangleIcon from 'src/resources/public/triangleIcon/triangle.svg?react'
import { Circle } from 'lucide-react';
import React from "react";

export const nodePanel = cva(
  ["bg-node-bg text-node-fg flex flex-col rounded-md border border-node-outline shadow-sm hover:ring-2 hover:ring-accent/70"],
  {
    variants: {
      selected: {
        true: ["border-node-selected"],
        false: null,
      }
    },
    defaultVariants: {
      selected: false,
    },
  }
)

export const NodeContainer = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & VariantProps<typeof nodePanel>
>(({ selected, ...props }, ref) => (
  <div
    ref={ref}
    data-testid="node"
    className={cn(nodePanel({ selected }))}
    {...props}
  />
))
NodeContainer.displayName = "NodePanel"

export function NodeHeader({ ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("rounded-t-md bg-gradient-to-r from-node-header/90 to-node-header")}
      {...props}
    />
  )
}

export function NodeTitle({ ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-testid="title"
      className={cn(["node-title-size leading-none pl-2 py-2 tracking-tight font-semibold"])}
      {...props}
    />
  )
}

export function NodeSocketsWrapper({ ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("flex flex-col w-full pt-1 gap-1")}
      {...props}
    />
  )
}


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

export const inputValueStyles = cva(
  ["nodrag w-full rounded-full border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"],
  {
    variants: {
      editable: {
        true: "",
        false: "bg-gray-100 cursor-not-allowed",
      }
    }
  }
);



const nodePortStyles = cva(
  ["flex flex-row w-full items-center node-socket-text-size tracking-tight"],
  {
    variants: {
      side: {
        input: "justify-start",
        output: "justify-end",
      },
      isShowControl: {
        true: "w-full h-full px-2",
        false: null
      }
    },
    defaultVariants: {
      side: "input",
      isShowControl: false,
    },
  }
);

// input/outputのポート
export function NodePort({
  side,
  isShowControl,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof nodePortStyles>) {
  return <div {...props}
    className={nodePortStyles({ side, isShowControl })} />;
}

// ソケットの名前（ラベル）
export function NodeSocketName({ ...props }: React.ComponentProps<"div">) {
  return <div {...props} className="inline-block align-middle mx-1" />;
}

// ソケットの型表示
export function NodeSocketTypeLabel({ ...props }: React.ComponentProps<"div">) {
  return <div {...props} className=" px-1 bg-node-label" />;
}

const socketIconWrapperStyles = cva(
  ["group cursor-pointer flex socket-icon-wrapper-size rounded-full items-center justify-center"],
)

const execIconStyles = cva(
  [" stroke-[#f2ffee]"],
  {
    variants: {
      isConnected: {
        true: "socket-icon-size-connected fill-[var(--execSocket)]",
        false: "socket-icon-size fill-[var(--execSocket)] opacity-60",
      },
    },
    defaultVariants: {
      isConnected: false,
    },
  })

export function NodeExecSocket({ title, isConnected }: { title: string } & VariantProps<typeof execIconStyles>) {
  return (
    <div className={socketIconWrapperStyles()}>
      <div
        className="rounded-full transform transition-all duration-100 group-hover:scale-115"
        title={title}
      >
        <TriangleIcon
          className={execIconStyles({ isConnected })}
        />
      </div>
    </div>
  )
}

const dataIconStyles = cva(
  ["fill-[var(--color-dataSocket)] text-dataSocket"],
  {
    variants: {
      isConnected: {
        true: "socket-icon-size-connected ",
        false: "socket-icon-size opacity-60",
      },
    },
    defaultVariants: {
      isConnected: false,
    },
  })

export function NodeDataSocket({ isConnected, title }: { title: string } & VariantProps<typeof dataIconStyles>) {
  return (
    <div className={socketIconWrapperStyles()}>
      <div
        className=" transform transition-all duration-100 group-hover:scale-115"
        title={title}
      >
        <Circle className={dataIconStyles({ isConnected })} />
      </div>
    </div>
  )
}

export function NodeControlsWrapper({ ...props }: React.ComponentProps<"div">) {
  return (
    <div className='w-full h-full p-2 empty:p-0' {...props} />
  )
}
