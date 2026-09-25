import request from "@/utils/request";

export default {
  getLoginLogList: (data: Record<string, unknown>) => request.post("/api/log/pageQuery", data),
  getLoginLogDetail: (params: { infoId: number | string }) => request.get("/api/log/detail", { params }),
  deleteLoginLog: (data: { infoIds: (number | string)[] }) => request.post("/api/log/delete", data),
  cleanLoginLog: (data: { days: number }) => request.post("/api/log/clean", data),
};
