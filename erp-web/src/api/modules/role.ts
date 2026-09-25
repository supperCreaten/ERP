import request from "@/utils/request";

export default {
  getRoleList: (data: Record<string, unknown>) => request.post("/api/role/pageQuery", data),
  insertRole: (data: Record<string, unknown>) => request.post("/api/role/insert", data),
  updateRole: (data: Record<string, unknown>) => request.post("/api/role/update", data),
  updateRoleStatus: (data: Record<string, unknown>) => request.post("/api/role/updateStatus", data),
  getRoleDetail: (params: { roleId: number | string }) => request.get("/api/role/detail", { params }),
  getMenuConfig: (params: { roleId: number | string }) => request.get("/api/role/roleToMenu", { params }),
  saveMenuToRole: (data: Record<string, unknown>) => request.post("/api/role/saveMenuToRole", data),
  setUserConfig: (data: Record<string, unknown>) => request.post("/api/role/saveUserToRole", data),
  getUserConfig: (params: { roleId: number | string }) => request.get("/api/role/roleToUser", { params }),
  cancelUserToRole: (data: Record<string, unknown>) => request.post("/api/role/cancelUserToRole", data),
  deleteRole: (params: { roleId: number | string }) => request.get("/api/role/delete", { params }),
};
