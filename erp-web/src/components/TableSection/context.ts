import { createContext } from "react";

export type TableScrollLayout = {
  needsCardScroll: boolean;
  maxHeight: number;
  scrollAreaHeight: number;
};

export const INITIAL_TABLE_SCROLL_LAYOUT: TableScrollLayout = {
  needsCardScroll: false,
  maxHeight: 0,
  scrollAreaHeight: 0,
};

export type TableSectionScrollContextValue = {
  layout: TableScrollLayout;
  setLayout: (layout: TableScrollLayout) => void;
};

export const TableSectionScrollContext = createContext<TableSectionScrollContextValue>({
  layout: INITIAL_TABLE_SCROLL_LAYOUT,
  setLayout: () => {},
});
