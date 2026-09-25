import request from "@/utils/request";

export default {
  getOperLogList: (data: Record<string, unknown>) => request.post("/api/operLog/pageQuery", data),
  getOperLogDetail: (params: { operId: number | string }) => request.get("/api/operLog/detail", { params }),
  deleteOperLog: (data: { operIds: (number | string)[] }) => request.post("/api/operLog/delete", data),
  cleanOperLog: (data: { days: number }) => request.post("/api/operLog/clean", data),
};
