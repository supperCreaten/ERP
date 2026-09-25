import { Children, isValidElement, type ReactElement, type ReactNode } from "react";

export const BASIC_TABLE_TOOLBAR_LEFT = "BasicTableToolbarLeft";
export const BASIC_TABLE_TOOLBAR_RIGHT = "BasicTableToolbarRight";

type SlotProps = { children?: ReactNode };

/** 表格工具栏左侧插槽（仅作为 BasicTable 子节点标记，不单独渲染） */
export function BasicTableToolbarLeft(_props: SlotProps) {
  return null;
}
BasicTableToolbarLeft.displayName = BASIC_TABLE_TOOLBAR_LEFT;

/** 表格工具栏右侧按钮区插槽 */
export function BasicTableToolbarRight(_props: SlotProps) {
  return null;
}
BasicTableToolbarRight.displayName = BASIC_TABLE_TOOLBAR_RIGHT;

function isToolbarSlot(child: ReactElement, slotName: string) {
  const type = child.type as { displayName?: string };
  return type?.displayName === slotName;
}

export function parseToolbarChildren(children: ReactNode) {
  let toolbarLeft: ReactNode = null;
  let toolbarRight: ReactNode = null;
  const legacy: ReactNode[] = [];

  Children.forEach(children, (child) => {
    if (!isValidElement(child)) {
      if (child != null && child !== false) legacy.push(child);
      return;
    }
    if (isToolbarSlot(child, BASIC_TABLE_TOOLBAR_LEFT)) {
      toolbarLeft = (child.props as SlotProps).children;
      return;
    }
    if (isToolbarSlot(child, BASIC_TABLE_TOOLBAR_RIGHT)) {
      toolbarRight = (child.props as SlotProps).children;
      return;
    }
    legacy.push(child);
  });

  if (legacy.length) {
    const legacyNode = legacy.length === 1 ? legacy[0] : legacy;
    toolbarRight = toolbarRight ? (
      <>
        {toolbarRight}
        {legacyNode}
      </>
    ) : (
      legacyNode
    );
  }

  return { toolbarLeft, toolbarRight };
}
