import { createElement, useCallback, useEffect, useMemo, useState } from "react";
import { AutoComplete, Input, InputNumber, Radio, TreeSelect } from "antd";
import MyDialog from "@/components/BasicDialog";
import BasicForm from "@/components/BasicForm";
import api from "@/api";
import type { FormConfig } from "@/interface";
import { showMessage } from "@/utils/methods";
import { unwrapArray } from "@/utils/apiResponse";
import { useMenuStore, type MenuTreeNode } from "./useMenuProvider";
import FormLabelTip from "./FormLabelTip";
import {
  FRAME_OPTIONS,
  FULL_ROW_LABEL_COL,
  FULL_ROW_WRAPPER_COL,
  HALF_ROW_LABEL_COL,
  HALF_ROW_WRAPPER_COL,
  KEEP_ALIVE_OPTIONS,
  MENU_TYPE,
  MENU_TYPE_OPTIONS,
  STATUS_OPTIONS,
  VISIBLE_OPTIONS,
  isCacheToKeepAlive,
  keepAliveToIsCache,
  shouldShowFrameFields,
  shouldShowIcon,
  shouldShowMenuDetailFields,
  shouldShowRouteFields,
} from "../constants";
import { createIconList } from "@/icons";

const ICON_OPTIONS = createIconList();

/** 图标选择：下拉横向排列，空间不够自动换行 */
function IconAutoComplete(props: { value?: string; onChange?: (value: string) => void; placeholder?: string }) {
  const { value, onChange, placeholder } = props;
  const [search, setSearch] = useState(value ?? "");
  const [open, setOpen] = useState(false);
  useEffect(() => {
    setSearch(value ?? "");
  }, [value]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return ICON_OPTIONS;
    // 已是完整图标名时展示全部，方便改选
    if (ICON_OPTIONS.some((item) => item.value === search)) return ICON_OPTIONS;
    return ICON_OPTIONS.filter((item) => item.value.toLowerCase().includes(q));
  }, [search]);
  return (
    <AutoComplete
      className="icon_auto_complete"
      value={value}
      allowClear
      open={open}
      options={filtered}
      placeholder={placeholder}
      notFoundContent="无匹配图标"
      onOpenChange={setOpen}
      onChange={(next) => {
        setSearch(next ?? "");
        onChange?.(next ?? "");
      }}
      popupRender={() => (
        <div className="flex max-h-64 flex-wrap gap-1 overflow-auto p-2">
          {filtered.map((item) => (
            <div
              key={item.value}
              className="flex min-w-24 cursor-pointer items-center rounded px-2 py-1"
              style={{ background: value === item.value ? "skyblue" : undefined }}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                setSearch(item.value);
                onChange?.(item.value);
                setOpen(false);
              }}
            >
              {item.label}
            </div>
          ))}
        </div>
      )}
    />
  );
}

type MenuFormValues = {
  parentId?: number;
  menuType?: string;
  icon?: string;
  menuName?: string;
  orderNum?: number;
  isFrame?: string;
  path?: string;
  perms?: string;
  keepAlive?: string;
  hidden?: string;
  status?: string;
};

type MenuDetail = {
  parentId?: number;
  menuType?: string | number;
  icon?: string;
  menuName?: string;
  orderNum?: number;
  path?: string;
  perms?: string;
  isFrame?: string | number;
  visible?: string | number;
  hidden?: string | number;
  status?: string | number;
  isCache?: string | number;
  keepAlive?: string | number;
};

function buildParentTreeData(list: MenuTreeNode[] = []): MenuTreeNode[] {
  return [{ menuId: 0, menuName: "主类目", children: list }];
}

function asOptionValue(value?: string | number, fallback = "0") {
  return value == null || value === "" ? fallback : `${value}`;
}

function mapDetailToForm(data?: MenuDetail): MenuFormValues {
  return {
    parentId: data?.parentId ?? 0,
    menuType: asOptionValue(data?.menuType, MENU_TYPE.DIRECTORY),
    icon: data?.icon || undefined,
    menuName: data?.menuName,
    orderNum: data?.orderNum ?? 0,
    path: data?.path || undefined,
    perms: data?.perms || undefined,
    isFrame: asOptionValue(data?.isFrame, "1"),
    hidden: asOptionValue(data?.visible ?? data?.hidden, "0"),
    status: asOptionValue(data?.status, "0"),
    keepAlive: isCacheToKeepAlive(data?.isCache ?? data?.keepAlive),
  };
}
const initialValues = {
  menuType: "0",
  isFrame: "1",
  hidden: "0",
  keepAlive: "1",
  status: "0",
};
function buildSubmitPayload(values?: MenuFormValues, menuId?: string) {
  const menuType = values?.menuType ?? MENU_TYPE.DIRECTORY;
  const isMenuLike = menuType === MENU_TYPE.MENU || menuType === MENU_TYPE.PAGE;
  const isButton = menuType === MENU_TYPE.BUTTON;
  const keepAlive = isMenuLike ? (values?.keepAlive ?? "1") : "0";

  return {
    ...(menuId ? { menuId } : {}),
    menuName: values?.menuName,
    menuType,
    parentId: values?.parentId ?? 0,
    icon: values?.icon,
    perms: values?.perms,
    orderNum: values?.orderNum ?? 0,
    status: values?.status ?? "0",
    visible: values?.hidden ?? "0",
    isCache: keepAliveToIsCache(keepAlive),
    isFrame: values?.isFrame ?? "1",
    ...(!isButton ? { path: values?.path ?? "" } : {}),
  };
}

export default function AddMenu(props: { onClose: (type?: string) => void }) {
  const { onClose } = props;
  const { state, dispatch } = useMenuStore();
  const [form] = BasicForm.useForm<MenuFormValues>();
  const watchedMenuType = BasicForm.useWatch("menuType", form);
  const menuType = watchedMenuType ?? MENU_TYPE.DIRECTORY;

  const isEdit = state.title === "修改菜单";
  const fullRow = { labelCol: FULL_ROW_LABEL_COL, wrapperCol: FULL_ROW_WRAPPER_COL };
  const halfRow = { labelCol: HALF_ROW_LABEL_COL, wrapperCol: HALF_ROW_WRAPPER_COL };

  const formConfig = useMemo((): FormConfig[] => {
    const fields: FormConfig[] = [
      {
        colProps: { xl: 24 },
        formItemProps: {
          label: "上级菜单",
          name: "parentId",
          ...fullRow,
          rules: [{ required: true, message: "请选择上级菜单" }],
        },
        component: (
          <TreeSelect
            showSearch
            style={{ width: "100%" }}
            styles={{ popup: { root: { maxHeight: 400, overflow: "auto" } } }}
            fieldNames={{ label: "menuName", value: "menuId", children: "children" }}
            placeholder="请选择上级菜单"
            allowClear
            treeData={state?.treeData}
          />
        ),
      },
      {
        colProps: { xl: 24 },
        formItemProps: { label: "菜单类型", name: "menuType", ...fullRow },
        component: <Radio.Group options={MENU_TYPE_OPTIONS} />,
      },
    ];

    if (shouldShowIcon(menuType)) {
      fields.push({
        colProps: { xl: 24 },
        formItemProps: {
          label: "菜单图标",
          name: "icon",
          ...fullRow,
          rules: menuType === MENU_TYPE.DIRECTORY ? [{ required: true, message: "请输入菜单图标" }] : [],
        },
        component: <IconAutoComplete placeholder="请输入图标名称，如 system" />,
      });
    }

    fields.push({
      colProps: { xl: 12 },
      formItemProps: {
        label: "菜单名称",
        name: "menuName",
        type: "text",
        rules: [{ required: true, message: "请输入菜单名称" }],
        ...halfRow,
      },
      component: <Input placeholder="请输入菜单名称" allowClear />,
    });
    if (menuType !== MENU_TYPE.PAGE) {
      fields.push({
        colProps: { xl: 12 },
        formItemProps: {
          label: "显示排序",
          name: "orderNum",
          rules: [{ required: true, message: "请输入显示排序" }],
          ...halfRow,
        },
        component: <InputNumber min={0} className="w-full" placeholder="请输入显示排序" />,
      });
    }
    if (shouldShowFrameFields(menuType)) {
      fields.push({
        colProps: { xl: 12 },
        formItemProps: {
          label: <FormLabelTip label="是否外链" tip="选择是外链则路由地址需要以 http(s):// 开头" />,
          name: "isFrame",
          ...halfRow,
        },
        component: <Radio.Group options={FRAME_OPTIONS} />,
      });
    }
    if (shouldShowRouteFields(menuType)) {
      fields.push({
        colProps: { xl: 12 },
        formItemProps: {
          label: <FormLabelTip label="路由地址" tip="访问的路由地址，如：user；外链请填写完整 URL" />,
          name: "path",
          type: "text",
          rules: [{ required: true, message: "请输入路由地址" }],
          ...halfRow,
        },
        component: <Input placeholder="请输入路由地址" allowClear />,
      });
    }
    if (menuType !== MENU_TYPE.PAGE) {
      fields.push({
        colProps: { xl: 12 },
        formItemProps: {
          label: <FormLabelTip label="权限字符" tip="控制器中定义的权限字符，如：system:user:list；按钮类型建议填写完整权限标识" />,
          name: "perms",
          type: "text",
          rules: menuType === MENU_TYPE.BUTTON ? [{ required: true, message: "请输入权限标识" }] : [],
          ...halfRow,
        },
        component: <Input placeholder="请输入权限标识" allowClear />,
      });
    }

    if (shouldShowMenuDetailFields(menuType)) {
      fields.push({
        colProps: { xl: 12 },
        formItemProps: {
          label: <FormLabelTip label="是否缓存" tip="选择缓存则会被 keep-alive 缓存" />,
          name: "keepAlive",
          ...halfRow,
        },
        component: <Radio.Group options={KEEP_ALIVE_OPTIONS} />,
      });
    }

    if (menuType !== MENU_TYPE.BUTTON) {
      fields.push({
        colProps: { xl: 12 },
        formItemProps: {
          label: <FormLabelTip label="显示状态" tip="选择隐藏则路由将不会出现在侧边栏，但仍然可以访问" />,
          name: "hidden",
          ...halfRow,
        },
        component: <Radio.Group options={VISIBLE_OPTIONS} />,
      });
    }

    fields.push({
      colProps: { xl: 12 },
      formItemProps: {
        label: <FormLabelTip label="菜单状态" tip={menuType === MENU_TYPE.BUTTON ? "选择停用则按钮权限将不可用" : "选择停用则路由将禁止访问"} />,
        name: "status",
        ...halfRow,
      },
      component: <Radio.Group options={STATUS_OPTIONS} />,
    });

    return fields;
  }, [menuType, state?.treeData]);

  const loadTreeData = useCallback(async () => {
    try {
      const res = await api.getMenus();
      dispatch({ type: "SET_TREE_DATA", treeData: buildParentTreeData(unwrapArray(res) as MenuTreeNode[]) });
    } catch {
      dispatch({ type: "SET_TREE_DATA", treeData: buildParentTreeData() });
    }
  }, [dispatch]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      dispatch({ type: "ADD_MENU", addMenuLoading: true });
      const payload = buildSubmitPayload(values, isEdit ? state?.menuId : undefined);

      if (isEdit) {
        await api.updateMenu(payload);
      } else {
        await api.insertMenu(payload);
      }

      showMessage(`${state?.title}成功`, "success");
      onClose?.("submit");
    } finally {
      dispatch({ type: "ADD_MENU", addMenuLoading: false });
    }
  };

  useEffect(() => {
    const init = async () => {
      dispatch({ type: "INIT", loading: true });
      try {
        await loadTreeData();
        if (state.menuId && state.title === "新增菜单") {
          form.setFieldsValue({ parentId: +state.menuId });
        }
        if (!isEdit) return;
        const data = await api.getMenuDetail({ menuId: state.menuId });
        form.setFieldsValue(mapDetailToForm(data));
      } finally {
        dispatch({ type: "INIT", loading: false });
      }
    };
    init();
  }, []);

  return (
    <MyDialog open={state?.visible} title={state?.title} width={700} confirmLoading={state?.addMenuLoading} loading={state?.loading} onOk={handleSubmit} onCancel={() => onClose?.()}>
      <BasicForm
        formConfig={formConfig}
        otherFormConfig={{
          form,
          initialValues,
          preserve: true,
        }}
      />
    </MyDialog>
  );
}
