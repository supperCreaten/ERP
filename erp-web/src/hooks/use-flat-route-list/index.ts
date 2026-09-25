import { useMemo } from "react";
import { useSelector } from "react-redux";
import { buildFlatRouteList } from "@/router/utils/flat-route-list";
import { menuDaTa } from "@/store/modules/menu";

export function useFlatRouteList() {
  const { wholeMenus } = useSelector(menuDaTa);
  return useMemo(() => buildFlatRouteList(wholeMenus), [wholeMenus]);
}
