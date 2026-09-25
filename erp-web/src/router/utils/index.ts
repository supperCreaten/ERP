import { useMemo } from "react";
import { useSelector } from "react-redux";
import { generateRoutesFromBackend } from "@/router/utils/generate-routes-from-backend";
export const useDynamicRoutes = () => {
  const { wholeMenus } = useSelector((state: { menu: { wholeMenus: any[] } }) => state.menu);
  return useMemo(() => {
    if (!wholeMenus?.length) return []
    return generateRoutesFromBackend(wholeMenus)
  }, [wholeMenus])
}
