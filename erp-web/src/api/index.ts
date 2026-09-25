/**
 * 自动合并 `./modules/*.ts` 的 default 导出，新增模块文件即可，无需改此文件。
 * 新增 `modules/*.ts` 后，请把该文件的 default 类型并入下方的 `Api` 交叉类型。
 */
const modules = import.meta.glob("./modules/*.ts", { eager: true, import: "default" })

/** 与各模块 default 导出合并后的 API 类型（供 import api from '@/api' 使用） */
export type Api = typeof import("./modules/user").default &
  typeof import("./modules/menu").default &
  typeof import("./modules/role").default &
  typeof import("./modules/operLog").default &
  typeof import("./modules/loginLog").default &
  typeof import("./modules/common").default &
  typeof import("./modules/dict").default &
  typeof import("./modules/user_profile").default &
  typeof import("./modules/customer").default & 
  typeof import("./modules/house").default

const api = Object.values(modules).reduce<Api>((acc, cur) => {
  return Object.assign(acc, cur as Partial<Api>)
}, {} as Api)

export default api
