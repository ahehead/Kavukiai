import { cva, type VariantProps } from "class-variance-authority"

export function TabBarComponent({ ...props }: React.ComponentProps<"div">) {
  return (
    <div {...props} className="flex bg-sidebar" />
  )
}

export function TabItems({ ...props }: React.ComponentProps<"div">) {
  return (
    <div {...props} className="flex bg-sidebar flex-nowrap overflow-hidden" />
  )
}

export function TabAddButtonSpace({ ...props }: React.ComponentProps<"div">) {
  return (
    <div {...props} className="flex flex-1 items-center pl-2 flex-shrink-0 focus:outline-0" />
  );
}

const tabItemStyles = cva(
  'flex min-w-0 items-center pl-3 pr-2 py-2 cursor-pointer border-x-1',
  {
    variants: {
      active: {
        true: 'bg-background border-b-2 border-b-primary',
        false: 'bg-sidebar',
      },
    },
    defaultVariants: {
      active: false,
    },
  }
)

export function TabItemComponent({ active, ...props }: React.ComponentProps<"div"> & VariantProps<typeof tabItemStyles>) {
  return (
    <div {...props} className={tabItemStyles({ active })} />
  )
}


export function TabTitle({ ...props }: React.ComponentProps<"span">) {
  return (
    <span {...props} className="flex-shrink min-w-0 truncate tracking-tight mr-1" />
  )
}
