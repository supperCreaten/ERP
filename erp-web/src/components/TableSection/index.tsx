import { Card } from "antd";
import { Children, isValidElement, ReactNode, useMemo, useState } from "react";
import { cn } from "@/utils/methods";
import {
  INITIAL_TABLE_SCROLL_LAYOUT,
  TableSectionScrollContext,
} from "./context";

type SlotProps = { children?: ReactNode };

function TableSectionHeader({ children }: SlotProps) {
  return <>{children}</>;
}
TableSectionHeader.displayName = "TableSection.Header";

function TableSectionContent({ children }: SlotProps) {
  return <>{children}</>;
}
TableSectionContent.displayName = "TableSection.Content";

function TableSectionFooter({ children }: SlotProps) {
  return <>{children}</>;
}
TableSectionFooter.displayName = "TableSection.Footer";

const SLOT_NAMES = new Set([
  "TableSection.Header",
  "TableSection.Content",
  "TableSection.Footer",
]);

function findSlot(children: ReactNode, slotName: string): ReactNode {
  let slotContent: ReactNode = null;

  Children.forEach(children, (child) => {
    if (!isValidElement<SlotProps>(child)) return;
    const type = child.type as { displayName?: string };
    if (type?.displayName === slotName) {
      slotContent = child.props.children;
    }
  });

  return slotContent;
}

function findExtraNodes(children: ReactNode): ReactNode[] {
  const extras: ReactNode[] = [];

  Children.forEach(children, (child) => {
    if (!isValidElement(child)) {
      if (child != null && child !== false) extras.push(child);
      return;
    }
    const type = child.type as { displayName?: string };
    if (!SLOT_NAMES.has(type?.displayName ?? "")) {
      extras.push(child);
    }
  });

  return extras;
}

type TableSectionProps = {
  children?: ReactNode;
};

function TableSection({ children }: TableSectionProps) {
  const [layout, setLayout] = useState(INITIAL_TABLE_SCROLL_LAYOUT);
  const scrollContext = useMemo(
    () => ({ layout, setLayout }),
    [layout],
  );

  const header = findSlot(children, "TableSection.Header");
  const content = findSlot(children, "TableSection.Content");
  const footer = findSlot(children, "TableSection.Footer");
  const extraNodes = findExtraNodes(children);

  return (
    <TableSectionScrollContext.Provider value={scrollContext}>
      <div className="flex h-full min-h-0 flex-col">
        {header}
        <Card
          className={cn(
            "table-section-card flex h-0 min-h-0 flex-1 flex-col overflow-hidden",
            "[&_.ant-card-body]:flex [&_.ant-card-body]:min-h-0 [&_.ant-card-body]:flex-1 [&_.ant-card-body]:flex-col",
            layout.needsCardScroll && "table-section-card--outer-scroll",
            "pl-2 pr-2",
          )}
        >
          {content}
        </Card>
        {footer}
        {extraNodes}
      </div>
    </TableSectionScrollContext.Provider>
  );
}

type TableSectionComponent = typeof TableSection & {
  Header: typeof TableSectionHeader;
  Content: typeof TableSectionContent;
  Footer: typeof TableSectionFooter;
};

const TableSectionWithSlots = TableSection as TableSectionComponent;
TableSectionWithSlots.Header = TableSectionHeader;
TableSectionWithSlots.Content = TableSectionContent;
TableSectionWithSlots.Footer = TableSectionFooter;

export default TableSectionWithSlots;
