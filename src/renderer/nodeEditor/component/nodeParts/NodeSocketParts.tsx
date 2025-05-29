import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "renderer/lib/utils";
import TriangleIcon from 'src/resources/public/triangleIcon/triangle.svg?react'
import { Circle } from 'lucide-react';

// ソケット全体のラッパー
export function NodeSocketsWrapper({ ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("grid grid-cols-1 py-1 gap-2")}
      {...props} />
  );
}


const nodePortStyles = cva(
  ["flex w-full node-socket-text-size tracking-tight"],
  {
    variants: {
      side: {
        input: "justify-start",
        output: "justify-end",
      },
      isShowAndHaveControl: {
        true: "h-full px-2",
        false: "flex-row items-center"
      }
    },
    defaultVariants: {
      side: "input",
      isShowAndHaveControl: false,
    },
  }
);
// input/outputのポート

export function NodePort({
  side, isShowAndHaveControl: isShowControl, ...props
}: React.ComponentProps<"div"> & VariantProps<typeof nodePortStyles>) {
  return <div {...props}
    className={nodePortStyles({ side, isShowAndHaveControl: isShowControl })} />;
}

// ソケットの名前（ラベル）

export function NodeSocketName({ ...props }: React.ComponentProps<"div">) {
  return <div {...props} className="inline-block align-middle mx-1 min-w-0 truncate" />;
}
// ソケットの型表示

export function NodeSocketTypeLabel({ ...props }: React.ComponentProps<"div">) {
  return <div {...props} className=" px-1 bg-node-label inline-block max-w-full truncate" />;
}

export const socketIconWrapperStyles = cva([
  "group cursor-pointer flex socket-icon-wrapper-size rounded-full items-center justify-center",
]);

export const execIconStyles = cva([" stroke-[#f2ffee]"], {
  variants: {
    isConnected: {
      true: "socket-icon-size-connected fill-[var(--execSocket)]",
      false: "socket-icon-size fill-[var(--execSocket)] opacity-60",
    },
  },
  defaultVariants: {
    isConnected: false,
  },
});

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
