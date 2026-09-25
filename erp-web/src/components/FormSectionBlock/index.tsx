import type { ReactNode } from "react";

type FormSectionBlockProps = {
  title: string;
  children?: ReactNode;
  variant?: string;
  className?: string;
};

/** 表单分区标题块（替代已删除的 logistics/FormSectionBlock） */
export default function FormSectionBlock({ title, children, className }: FormSectionBlockProps) {
  return (
    <div className={className ? `form-section-block ${className}` : "form-section-block"}>
      <div className="form-section-block__title">{title}</div>
      <div className="form-section-block__body">{children}</div>
    </div>
  );
}
