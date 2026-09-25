/** 表体 scroll.y 低于此值时视为空间不足，由外层 Card 提供滚动 */
export const MIN_TABLE_BODY_SCROLL_Y = 120;
/** 退出 Card 滚动的表体高度阈值（滞回，避免临界高度来回切换导致闪烁） */
export const CARD_SCROLL_EXIT_MIN_BODY_Y = MIN_TABLE_BODY_SCROLL_Y + 32;
/** 高度变化小于该值时不更新 scroll.y，避免滚动条出现触发的 1～2px 抖动 */
export const TABLE_RESIZE_HEIGHT_EPS = 4;
/** TableSection 外层布局高度变化阈值，仅此时重算 scroll.y */
export const TABLE_LAYOUT_HEIGHT_EPS = 8;
