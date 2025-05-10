import { cn } from "renderer/lib/utils"
import { cva, type VariantProps } from "class-variance-authority";
import TriangleIcon from 'src/resources/public/triangleIcon/triangle.svg?react'
import { Circle } from 'lucide-react';

export const nodePanelValiant = cva(
  ["bg-node text-node-fg flex flex-col rounded-md border shadow-sm"],
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

export function NodePanel({ selected, ...props }: React.ComponentProps<"div"> & VariantProps<typeof nodePanelValiant>) {
  return (
    <div
      data-testid="node"
      className={cn(
        nodePanelValiant({ selected }),
      )}
      {...props}
    />
  )
}

export function NodePanelHeader({ ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("bg-node-header rounded-t-md")}
      {...props}
    />
  )
}

export function NodeTitle({ ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-testid="title"
      className={cn(["leading-none pl-2 py-2 tracking-tight"])}
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
  ["block w-full h-full p-1 resize-none border-none focus:outline-none ring-1 ring-gray-500 focus:ring-2 focus:ring-accent rounded-md"],
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
  ["flex flex-row items-center text-sm tracking-tight"],
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
  return <div {...props} className="rounded-md px-1 bg-node-label" />;
}

export function NodePanelControls({ ...props }: React.ComponentProps<"div">) {
  return (
    <div className='w-full h-full p-2'{...props} />
  )
}

const socketIconWrapperStyles = cva(
  ["group cursor-pointer flex socket-icon-wrapper-size rounded-full items-center justify-center"],
)

export function NodeExecSocket({ title }: { title: string }) {
  return (
    <div className={socketIconWrapperStyles()}>
      <div
        className="rounded-full transform transition-all duration-100 group-hover:scale-115"
        title={title}
      >
        <TriangleIcon
          className="socket-icon-size fill-[var(--color-execSocket)] stroke-[#f2ffee]"
        />
      </div>
    </div>
  )
}

export function NodeDataSocket({ title }: { title: string }) {
  return (
    <div className={socketIconWrapperStyles()}>
      <div
        className=" transform transition-all duration-100 group-hover:scale-115"
        title={title}
      >
        <Circle className="socket-icon-size fill-[var(--color-dataSocket)] text-[#686dcc]" />
      </div>
    </div>
  )
}
