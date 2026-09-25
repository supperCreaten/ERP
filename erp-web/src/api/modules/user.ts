import request from "@/utils/request";

export default {
  getUserList: (data: Record<string, unknown>) => request.post("/api/user/pageQuery", data),
  getUserDetail: (params: { userId: number | string }) => request.get("/api/user/detail", { params }),
  insertUser: (data: Record<string, unknown>) => request.post("/api/user/insert", data),
  updateUser: (data: Record<string, unknown>) => request.post("/api/user/update", data),
  updateUserStatus: (data: Record<string, unknown>) => request.post("/api/user/updateStatus", data),
  resetUserPassword: (data: Record<string, unknown>) => request.post("/api/user/resetPassword", data),
  deleteUser: (params: { userId: number | string }) => request.get("/api/user/delete", { params }),
  uploadUserAvatar: (data: FormData) =>
    request.post("/api/user/avatar", data, { headers: { "Content-Type": "multipart/form-data" } }),
};
