import { Action, configureStore, Reducer } from "@reduxjs/toolkit";
import reducer from "./modules";

export type { RootState } from "./modules";
const appReducer = reducer as Reducer<unknown, Action>;
// 1. 导入 enableMapSet
import { enableMapSet } from 'immer';

// 2. 立即调用它来启用对 Map 和 Set 的支持
enableMapSet();
const rootReducer: Reducer<unknown, Action> = (state, action) => {
  // 退出登录时重置所有 slice 状态
  if (action.type === "auth/logout") {
    state = undefined;
  }
  return appReducer(state, action);
};
const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});
export default store;
