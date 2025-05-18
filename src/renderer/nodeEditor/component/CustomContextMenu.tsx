import { Menu, MenuItemComponent, MenuSeparator, type ItemType } from "../../components/ContextMenuComponent";

interface RenderItemsProps {
  items: ItemType[];
  onHide?: () => void;
}

const RenderItems: React.FC<RenderItemsProps> = ({ items, onHide }) => {

  return (
    <div className="relative">
      {items.map((item, index) => {
        if (item.label === "---") {
          return <MenuSeparator key={item.key || `separator-${index}`} />;
        }
        const hasSubitems = !!item.subitems && item.subitems.length > 0;
        return (
          <div
            key={item.key}
            className="relative group"
          >
            <MenuItemComponent
              onClick={(e) => {
                if (!item.subitems && !item.disabled) {
                  item.handler();
                }
                if (onHide) { onHide() }
                e.stopPropagation();
              }}
              hasSubitems={hasSubitems}
              disabled={item.disabled}
            >
              {item.icon && (
                <span className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 flex items-center justify-center">
                  {item.icon}
                </span>
              )}
              {item.label}
            </MenuItemComponent>
            {hasSubitems && (
              <div
                className="absolute left-full top-[-1px] z-10 hidden group-hover:block"
                style={{ minWidth: '220px' }}
              >
                <Menu>
                  {item.subitems ? <RenderItems items={item.subitems} onHide={onHide} /> : null}
                </Menu>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export function CustomContextMenu({ items, searchBar, onHide }: { items: ItemType[]; searchBar?: boolean; onHide?: () => void }) {

  return (
    <Menu>
      {items.length > 0 && (
        <RenderItems items={items} onHide={onHide} />
      )}
    </Menu>
  );
}
