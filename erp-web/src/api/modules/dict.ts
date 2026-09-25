import request from "@/utils/request";
export default {
  getDictPageQuery: (data: Record<string, unknown>) => request.post("/api/dict/pageQuery", data),
  getDictByCode: (data: { dictCode: string }) => request.post("/api/dict/allDict", data),
  insertDict: (data: Record<string, unknown>) => request.post("/api/dict/insert", data),
  updateDict: (data: Record<string, unknown>) => request.post("/api/dict/update", data),
  getDictDetail: (id: string) => request.post(`/api/dict/queryById/${id}`),
  deleteDict: (data: Record<string, unknown>) => request.post("/api/dict/delete", data),
};
