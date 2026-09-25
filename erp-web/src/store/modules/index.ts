import { combineReducers, type StateFromReducersMapObject } from "@reduxjs/toolkit";
import menu from "./menu";
import user from "./user";
import preferences from "./preferences";
import tab from "./tabs";

const reducer = {
  menu,
  user,
  preferences,
  tab,
};

export type RootState = StateFromReducersMapObject<typeof reducer>;
export default combineReducers(reducer);