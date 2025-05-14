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

export const NodePanel = React.forwardRef<
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
NodePanel.displayName = "NodePanel"

export function NodePanelHeader({ ...props }: React.ComponentProps<"div">) {
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

export function NodePanelSockets({ ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("flex flex-col pt-1 gap-1")}
      {...props}
    />
  )
}


export const textAreaClasses = cva(
  ["block w-full h-full py-2 px-2.5 resize-none border-none focus:outline-none ring-1 ring-gray-500 focus:ring-2 focus:ring-accent rounded-md"],
  {
    variants: {
      editable: {
        true: "",
        false: "cursor-not-allowed bg-gray-100",
      },
    },
    defaultVariants: {
      editable: true,
    },
  }
);

const nodeSocketWrapperStyles = cva(
  ["flex flex-row items-center node-socket-text-size tracking-tight"],
  {
    variants: {
      side: {
        input: "justify-start",
        output: "justify-end",
      },
    },
    defaultVariants: {
      side: "input",
    },
  }
);

// ソケット行のラッパー
export function NodeSocketWrapper({
  side,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof nodeSocketWrapperStyles>) {
  return <div {...props}
    className={nodeSocketWrapperStyles({ side })} />;
}

// ソケットの名前（ラベル）
export function NodeSocketName({ ...props }: React.ComponentProps<"div">) {
  return <div {...props} className="inline-block align-middle mr-1" />;
}

// ソケットの型表示
export function NodeSocketTypeLabel({ ...props }: React.ComponentProps<"div">) {
  return <div {...props} className=" px-1 bg-node-label" />;
}

export function NodePanelControls({ ...props }: React.ComponentProps<"div">) {
  return (
    <div className='w-full h-full p-2'{...props} />
  )
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
