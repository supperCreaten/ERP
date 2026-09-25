import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "@/api";
import { logout } from "@/utils/methods";
import { unwrapRecord } from "@/utils/apiResponse";

export const getUserInfo = createAsyncThunk("menu/getUserInfo", async () => {
  const res = await api.getUserInfo();
  return unwrapRecord(res);
});

/** 清理本地态并跳转登录页；接口失败时 logout 仍会执行本地清理 */
export const userLogout = createAsyncThunk("menu/userLogout", async () => {
  await logout();
});

const userSlice = createSlice({
  name: "user",
  initialState: {
    userInfo: {} as Record<string, unknown>,
    avatar: "https://avatars.githubusercontent.com/u/47056890",
  },
  reducers: {
    setUserInfo(state, action) {
      state.userInfo = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getUserInfo.fulfilled, (state, action) => {
        state.userInfo = action.payload ?? {};
      })
      .addCase(getUserInfo.rejected, (state) => {
        state.userInfo = {};
      });
  },
});

export const { setUserInfo } = userSlice.actions;
export default userSlice.reducer;
