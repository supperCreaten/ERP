import type { AxiosRequestConfig } from "axios"
import request from "@/utils/request"
export default {
  customerPageQuery: (data: Record<string, unknown>) => request.post("/api/customer/pageQuery", data),
  insertCustomer: (data: Record<string, unknown>) => request.post("/api/customer/insert", data),
  updateCustomer: (data: Record<string, unknown>) => request.post("/api/customer/update", data),
  getCustomerDetail: (id: string) => request.post(`/api/customer/queryById/${id}`),
  deleteCustomer: (data: Array<string | number>) => request.post("/api/customer/delete", data),
  importCustomer: (data: FormData, config?: AxiosRequestConfig) =>
    request.post("/api/customer/import", data, {
      headers: { "Content-Type": "multipart/form-data" },
      ...config,
    }),
  downloadCustomerImportTemplate: () => request.post("/api/customer/importTemplate", {}, { responseType: "blob" }),
  exportCustomer: (data: Record<string, unknown>) =>
    request.post("/api/customer/export", data, { responseType: "blob" }),
}
