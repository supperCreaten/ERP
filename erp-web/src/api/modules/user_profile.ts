import request from "@/utils/request";
export default {
  pageQueryProfile: (data: Record<string, unknown>) => request.post("/api/service/userProfile/pageQuery", data),
  insertProfile: (id: string, data: Record<string, unknown>) => request.post(`/api/service/userProfile/insert/${id}`, data),
  updateProfile: (id: string, data: Record<string, unknown>) => request.post(`/api/service/userProfile/update/${id}`, data),
  queryByIdProfile: (id: string, data: string) => request.post(`/api/service/userProfile/queryById/${id}`, data),
  deleteProfile: (data: Record<string, unknown>) => request.post("/api/service/userProfile/delete", data),
};
