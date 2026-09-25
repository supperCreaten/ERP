import { useReducer } from "react";

export interface SearchBoxState {
  collapsed: boolean;
}

const initialState: SearchBoxState = {
  collapsed: true,
};

type SetCollapsedAction = {
  type: "SET_COLLAPSED";
  collapsed: boolean;
};

type SearchBoxAction = SetCollapsedAction;

function reducer(state: SearchBoxState, action: SearchBoxAction): SearchBoxState {
  switch (action.type) {
    case "SET_COLLAPSED":
      return {
        ...state,
        collapsed: action.collapsed,
      };
    default:
      return state;
  }
}

export function useSearchBox() {
  const [state, dispatch] = useReducer(reducer, initialState);
  return { state, dispatch };
}
