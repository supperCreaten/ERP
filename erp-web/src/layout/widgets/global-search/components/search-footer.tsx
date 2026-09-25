import { Icon } from "@iconify/react";
import { clsx } from "clsx";

export type GlobalSearchFooterKeyHint = "up" | "down" | "esc" | "enter" | null;

interface SearchFooterProps {
  searchItems: number;
  keyHint?: GlobalSearchFooterKeyHint;
}

export function SearchFooter({ searchItems, keyHint }: SearchFooterProps) {
  return (
    <div className="global-search-footer p-1!">
      <div className="global-search-footer-main">
        <div className="global-search-footer-chip p-1!">
          <span className="global-search-footer-kbd-row" aria-hidden>
            <span
              className={clsx(
                "global-search-footer-kbd global-search-footer-kbd--icon",
                keyHint === "up" && "global-search-footer-kbd--pressed",
              )}
            >
              <Icon icon="ant-design:arrow-up" />
            </span>
            <span
              className={clsx(
                "global-search-footer-kbd global-search-footer-kbd--icon",
                keyHint === "down" && "global-search-footer-kbd--pressed",
              )}
            >
              <Icon icon="ant-design:arrow-down" />
            </span>
          </span>
          <span className="global-search-footer-hint">导航</span>
        </div>
        <div className="global-search-footer-chip p-1!">
          <span className={clsx("global-search-footer-kbd", keyHint === "esc" && "global-search-footer-kbd--pressed")}>Esc</span>
          <span className="global-search-footer-hint">关闭</span>
        </div>
        <div className="global-search-footer-chip p-1!">
          <span
            className={clsx(
              "global-search-footer-kbd global-search-footer-kbd--icon",
              keyHint === "enter" && "global-search-footer-kbd--pressed",
            )}
            aria-hidden
          >
            <Icon icon="ant-design:enter" />
          </span>
          <span className="global-search-footer-hint">选择</span>
        </div>
      </div>
      <div className="global-search-footer-count p-1!" role="status" aria-live="polite">
        <span className="global-search-footer-count-muted">共</span>
        <span className="global-search-footer-count-num">{searchItems}</span>
        <span className="global-search-footer-count-muted">项</span>
      </div>
    </div>
  );
}
