import { Card } from "antd";
import { Children, isValidElement, ReactNode } from "react";

type SlotProps = { children?: ReactNode };

function ContentSectionHeader({ children }: SlotProps) {
  return <>{children}</>;
}
ContentSectionHeader.displayName = "ContentSection.Header";

function ContentSectionContent({ children }: SlotProps) {
  return <>{children}</>;
}
ContentSectionContent.displayName = "ContentSection.Content";

function ContentSectionFooter({ children }: SlotProps) {
  return <>{children}</>;
}
ContentSectionFooter.displayName = "ContentSection.Footer";

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

type ContentSectionProps = {
  children?: ReactNode;
};

function ContentSection({ children }: ContentSectionProps) {
  const header = findSlot(children, "ContentSection.Header");
  const content = findSlot(children, "ContentSection.Content");
  const footer = findSlot(children, "ContentSection.Footer");

  return (
    <div className="box-border flex h-full min-h-0 flex-col p-2.5">
      {header && <div className="shrink-0">{header}</div>}
      <Card className="flex-1 overflow-y-auto overflow-x-hidden my-1">{content}</Card>
      {footer && <div className="shrink-0 text-center mt-2">{footer}</div>}
    </div>
  );
}

type ContentSectionComponent = typeof ContentSection & {
  Header: typeof ContentSectionHeader;
  Content: typeof ContentSectionContent;
  Footer: typeof ContentSectionFooter;
};

const ContentSectionWithSlots = ContentSection as ContentSectionComponent;
ContentSectionWithSlots.Header = ContentSectionHeader;
ContentSectionWithSlots.Content = ContentSectionContent;
ContentSectionWithSlots.Footer = ContentSectionFooter;

export default ContentSectionWithSlots;
