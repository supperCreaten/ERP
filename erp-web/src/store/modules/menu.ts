import {  createSlice } from "@reduxjs/toolkit";
import { MenuInitialState } from "@/interface";
const initialState: MenuInitialState = {
  wholeMenus: [],
  isAccessChecked: false,
};
const menuSlice = createSlice({
  name: "menu",
  initialState,
  reducers: {
    setMenuList(state, actions) {
      state.wholeMenus = actions.payload;
      state.isAccessChecked = true;
    },
  },
});
export const menuDaTa = (state: { menu: MenuInitialState }) => state.menu;
export const { setMenuList } = menuSlice.actions;
//默认导出reducer动作
export default menuSlice.reducer;
