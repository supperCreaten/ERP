import request from "@/utils/request";

export default {
  getMenus: (data?: Record<string, unknown>) => request.post("/api/menu/pageQuery", data ?? {}),
  getMenuDetail: (params: { menuId: number | string }) => request.get("/api/menu/detail", { params }),
  insertMenu: (data: Record<string, unknown>) => request.post("/api/menu/insert", data),
  updateMenu: (data: Record<string, unknown>) => request.post("/api/menu/update", data),
  deleteMenu: (params: { menuId: number | string }) => request.get("/api/menu/delete", { params }),
};
