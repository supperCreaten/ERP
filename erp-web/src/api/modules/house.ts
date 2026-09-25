import request from "@/utils/request";
export default {
  getHousePageQuery: (data: Record<string, unknown>) => request.post("/api/house/pageQuery", data),
  insertHouse: (data: Record<string, unknown>) => request.post("/api/house/insert", data),
  updateHouse: (data: Record<string, unknown>) => request.post("/api/house/update", data),
  getHouseDetail: (id: string) => request.post(`/api/house/queryById/${id}`),
  deleteHouse: (data: string[]) => request.post("/api/house/delete", data),
};
