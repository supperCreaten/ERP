import type { DragEndEvent } from "@dnd-kit/core";
import type { MenuProps, TabsProps } from "antd";
import { closestCenter, DndContext, PointerSensor, useSensor } from "@dnd-kit/core";
import {
  horizontalListSortingStrategy,
  SortableContext,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Dropdown } from "antd";
import { cloneElement } from "react";
import type { TabItemProps } from "@/interface";
import { useAppDispatch } from "@/utils/methods";
import { useSelector } from "react-redux";
import type { RootState } from "@/store";
import { changeTabOrder } from "@/store/modules/tabs";

interface DraggableTabPaneProps extends React.HTMLAttributes<HTMLElement> {
  "data-node-key": string;
  children: React.ReactElement;
}

export function DraggableTabNode({ className, children, ...props }: DraggableTabPaneProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: props["data-node-key"],
  });

  const style: React.CSSProperties = {
    ...props.style,
    transform: CSS.Translate.toString({ x: transform?.x || 0, y: 0, scaleX: 1, scaleY: 1 }),
    transition,
    cursor: isDragging ? "move" : "pointer",
  };

  return cloneElement(children, {
    ref: setNodeRef,
    ...props,
    style,
    className,
    ...attributes,
    ...listeners,
  } as React.HTMLAttributes<HTMLElement>);
}

interface DraggableTabBarProps {
  tabBarProps: Parameters<Required<TabsProps>["renderTabBar"]>[0];
  DefaultTabBar: Parameters<Required<TabsProps>["renderTabBar"]>[1];
  tabItems: TabItemProps[];
  items: (tabKey: string) => MenuProps["items"];
  onClickMenu: (menuKey: string, nodeKey: string) => void;
  menuClassName?: string;
}

export function DraggableTabBar({
  tabBarProps,
  DefaultTabBar,
  tabItems,
  items,
  onClickMenu,
  menuClassName,
}: DraggableTabBarProps) {
  const sensor = useSensor(PointerSensor, { activationConstraint: { distance: 5 } });
  const dispatch = useAppDispatch();
  const openTabs = useSelector((state: RootState) => state.tab.openTabs);

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;

    const keys = Array.from(openTabs.keys());
    const from = keys.indexOf(`${active.id}`);
    const to = keys.indexOf(`${over.id}`);
    if (from < 0 || to < 0) return;

    dispatch(changeTabOrder({ from, to }));
  };

  return (
    <DndContext sensors={[sensor]} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
      <SortableContext items={tabItems.map((item) => item.key)} strategy={horizontalListSortingStrategy}>
        <DefaultTabBar {...tabBarProps}>
          {(node) => (
            <Dropdown
              key={node.key}
              trigger={["contextMenu"]}
              menu={{
                items: items(`${node.key}`),
                className: menuClassName,
                onClick: ({ key: menuKey }) => onClickMenu(menuKey, `${node.key}`),
              }}
            >
              {tabItems.some((tabItem) => tabItem.key === node.key && tabItem.draggable === false) ? (
                node
              ) : (
                <DraggableTabNode {...(node.props as DraggableTabPaneProps)}>{node}</DraggableTabNode>
              )}
            </Dropdown>
          )}
        </DefaultTabBar>
      </SortableContext>
    </DndContext>
  );
}
