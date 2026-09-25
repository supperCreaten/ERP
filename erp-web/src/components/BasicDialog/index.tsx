import type { CSSProperties, ReactElement, ReactNode } from "react";
import { Modal, Spin, type ModalProps } from "antd";
import DraggableModalShell from "./DraggableModalShell";

/** 弹框距视口上下留白（px），用于 max-height: calc(100vh - padding) */
const DEFAULT_VIEWPORT_PADDING = 48;
/** 与参考图一致：区块水平/上下内边距 */
const DIALOG_INSET_X = 24;
const DIALOG_BODY_PAD = `24px ${DIALOG_INSET_X}px`;
const DIALOG_FOOTER_PAD = `16px ${DIALOG_INSET_X}px 24px`;
/** 右侧 48px 为关闭按钮留白 */
const DIALOG_HEADER_PAD = `20px 48px 16px ${DIALOG_INSET_X}px`;

function buildDialogStyles(viewportPadding: number, override?: ModalProps["styles"], draggable?: boolean): ModalProps["styles"] {
  const maxHeight = `calc(100vh - ${viewportPadding}px)`;
  const base: ModalProps["styles"] = {
    content: {
      padding: 0,
      display: "flex",
      flexDirection: "column",
      maxHeight,
      overflow: "hidden",
    },
    header: {
      flexShrink: 0,
      margin: 0,
      marginBottom: 0,
      padding: DIALOG_HEADER_PAD,
      borderBottom: "1px solid #f0f0f0",
      background: "transparent",
      ...(draggable ? { cursor: "move", userSelect: "none" as const } : {}),
    },
    body: {
      flex: "1 1 auto",
      minHeight: 0,
      margin: 0,
      padding: DIALOG_BODY_PAD,
      overflowX: "hidden",
      overflowY: "auto",
    },
    footer: {
      flexShrink: 0,
      margin: 0,
      marginTop: 0,
      padding: DIALOG_FOOTER_PAD,
      borderTop: "1px solid #f0f0f0",
      background: "transparent",
    },
  };
  return {
    content: { ...base?.content, ...override?.content },
    header: { ...base?.header, ...override?.header },
    body: { ...base?.body, ...override?.body },
    footer: { ...base?.footer, ...override?.footer },
  };
}

function composeModalRender(draggable: boolean, open: boolean | undefined, renders: Array<ModalProps["modalRender"] | undefined>): ModalProps["modalRender"] | undefined {
  const customRenders = renders.filter(Boolean);
  if (!draggable && !customRenders.length) return undefined;

  return (modal) => {
    let node: ReactNode = modal;
    if (draggable) {
      node = (
        <DraggableModalShell enabled open={open}>
          {node as ReactElement}
        </DraggableModalShell>
      );
    }
    for (const render of customRenders) {
      node = render!(node);
    }
    return node;
  };
}

export type AppDialogProps = Omit<ModalProps, "modalRender"> & {
  /** 额外的 Modal 属性，可以覆盖主属性 */
  otherProps?: ModalProps;
  /** 相对视口上下留白总和，默认 48 */
  viewportPadding?: number;
  /** 是否垂直居中，默认 true；开启 draggable 时自动关闭居中以避免定位冲突 */
  centered?: boolean;
  /** 是否允许拖动标题栏移动弹框，默认 true */
  draggable?: boolean;
  submitLoading?: boolean;
  modalRender?: ModalProps["modalRender"];
};

export default function myDialog(props: AppDialogProps) {
  const {
    title = "默认弹框",
    otherProps = {},
    styles,
    classNames,
    rootClassName,
    viewportPadding = DEFAULT_VIEWPORT_PADDING,
    centered = true,
    draggable = true,
    style,
    loading = false,
    submitLoading = false,
    okButtonProps,
    children,
    okText = "确定",
    cancelText = "取消",
    modalRender: modalRenderProp,
    open,
    ...args
  } = props;
  const { modalRender: otherModalRender, centered: otherCentered, open: otherOpen, ...restOtherProps } = otherProps;

  const mergedOpen = open ?? otherOpen;
  const mergedModalRender = composeModalRender(draggable, mergedOpen, [otherModalRender, modalRenderProp]);

  const mergedClassNames: ModalProps["classNames"] = {
    ...classNames,
    content: [classNames?.content, "app-dialog-modal__content"].filter(Boolean).join(" "),
    header: [classNames?.header, "app-dialog-modal__header"].filter(Boolean).join(" "),
    body: [classNames?.body, "app-dialog-modal__body"].filter(Boolean).join(" "),
    footer: [classNames?.footer, "app-dialog-modal__footer"].filter(Boolean).join(" "),
  };

  const mergedStyle: CSSProperties = {
    ["--app-dialog-viewport-padding" as string]: `${viewportPadding}px`,
    ["--app-dialog-section-inset" as string]: `${DIALOG_INSET_X}px`,
    ["--app-dialog-header-pad-top" as string]: "20px",
    ...style,
  };

  return (
    <Modal
      title={title}
      centered
      open={mergedOpen}
      rootClassName={rootClassName ? `${rootClassName} app-dialog-modal` : "app-dialog-modal"}
      classNames={mergedClassNames}
      styles={buildDialogStyles(viewportPadding, styles, draggable)}
      style={mergedStyle}
      keyboard={false}
      maskClosable={false}
      destroyOnHidden
      okText={okText}
      cancelText={cancelText}
      okButtonProps={{
        loading: submitLoading,
        disabled: loading || okButtonProps?.disabled,
      }}
      modalRender={mergedModalRender}
      {...args}
      {...restOtherProps}
    >
      <Spin spinning={loading}>{children}</Spin>
    </Modal>
  );
}
