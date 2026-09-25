import type { Props as SimplebarProps } from "simplebar-react";

import { cn } from "@/utils/methods";
import SimpleBar from "simplebar-react";
import React from "react";

/**
 * @see https://github.com/Grsmto/simplebar/tree/master/packages/simplebar-react
 */
export function Scrollbar({ ref, children, ...other }: SimplebarProps & { ref?: React.RefObject<HTMLElement | null> }) {
  return (
    <SimpleBar
      autoHide={true}
      scrollableNodeProps={{ ref }}
      clickOnTrack={false}
      {...other}
      className={cn("h-full", other.className)}
    >
      {children}
    </SimpleBar>
  );
}
