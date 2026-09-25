import { useCallback, useEffect, useMemo, useState } from "react";
import BasicDialog from "@/components/BasicDialog";
import BasicForm from "@/components/BasicForm";
import { Card, Col, Input, InputNumber, Row, Spin, Switch, Tree, type TreeProps } from "antd";
import api from "@/api";
import { useRoleStore, type RoleMenuTreeNode } from "./useRoleProvider";
import { showMessage } from "@/utils/methods";
import type { FormConfig } from "@/interface";
import type { Key } from "react";
import { unwrapArray, unwrapRecord } from "@/utils/apiResponse";

const MENU_TREE_HEIGHT = 320;
const ROLE_FORM_LABEL_COL = { span: 6 };
const ROLE_FORM_WRAPPER_COL = { span: 18 };

/** 主键以字符串提交，避免雪花 ID 经 Number 丢精度 */
function toMenuIds(keys: Key[]): string[] {
  return keys.map((k) => String(k)).filter((k) => k !== "");
}

export default function AddRole(props: { onClose: (type?: string) => void }) {
  const { onClose } = props;
  const { state, dispatch } = useRoleStore();
  const [form] = BasicForm.useForm<any>();
  const [treeData, setTreeData] = useState<RoleMenuTreeNode[]>([]);
  const [selectedMenuKeys, setSelectedMenuKeys] = useState<Key[]>([]);
  const [treeLoading, setTreeLoading] = useState(false);
  const isEdit = state.title === "修改角色";

  const formConfig = useMemo(
    (): FormConfig[] => [
      {
        formItemProps: {
          label: "角色编码",
          name: "roleKey",
          type: "text",
          rules: [{ required: true, message: "请输入角色编码" }],
        },
        component: <Input disabled={isEdit} placeholder="请输入角色编码" allowClear />,
        colProps: { xl: 24 },
      },
      {
        formItemProps: {
          label: "角色名称",
          name: "roleName",
          type: "text",
          rules: [{ required: true, message: "请输入角色名称" }],
        },
        component: <Input placeholder="请输入角色名称" allowClear />,
        colProps: { xl: 24 },
      },
      {
        formItemProps: {
          label: "排序",
          name: "roleSort",
        },
        component: <InputNumber min={0} className="w-full" placeholder="请输入排序" />,
        colProps: { xl: 24 },
      },
      {
        formItemProps: {
          label: "状态",
          name: "status",
          valuePropName: "checked",
        },
        component: <Switch checkedChildren="启用" unCheckedChildren="停用" />,
        colProps: { xl: 24 },
      },
      {
        formItemProps: {
          label: "备注",
          name: "remark",
          type: "text",
        },
        component: <Input.TextArea rows={3} placeholder="请输入备注" allowClear maxLength={500} showCount />,
        colProps: { xl: 24 },
      },
    ],
    [isEdit],
  );

  const loadMenuTree = useCallback(async () => {
    setTreeLoading(true);
    try {
      const res = await api.getMenus();
      setTreeData(unwrapArray(res) as RoleMenuTreeNode[]);
    } finally {
      setTreeLoading(false);
    }
  }, []);

  const loadMenuConfig = useCallback(async () => {
    if (!state.roleId) return;
    try {
      const res = (await api.getMenuConfig({ roleId: state.roleId })) as {
        checkedKeys?: (string | number)[];
        data?: { checkedKeys?: (string | number)[] };
      };
      const keys = res?.checkedKeys ?? res?.data?.checkedKeys ?? [];
      setSelectedMenuKeys(keys.map((id) => String(id)));
    } catch {
      setSelectedMenuKeys([]);
    }
  }, [state.roleId]);
  const getDetail = async () => {
    dispatch({ type: "INIT", loading: true });
    try {
      const data = await api.getRoleDetail({ roleId: state.roleId! });
      form.setFieldsValue({
        roleKey: data.roleKey ?? data.roleCode,
        roleName: data.roleName,
        status: data.status === 0 || data.status === "0",
        roleSort: data.orderNum ?? 0,
        remark: data.remark,
      });
      await loadMenuConfig();
    } finally {
      dispatch({ type: "INIT", loading: false });
    }
  };
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (!selectedMenuKeys.length) {
        return showMessage("请选择菜单权限", "warning");
      }
      dispatch({ type: "ADD_ROLE_LOADING", addRoleLoading: true });
      const menuIds = toMenuIds(selectedMenuKeys);
      const params = {
        roleKey: values.roleKey,
        roleName: values.roleName,
        status: values.status ? "0" : "1",
        roleSort: values.roleSort ?? 0,
        remark: values.remark ?? "",
        menuIds,
      };
      if (isEdit) {
        await api.updateRole({ ...params, roleId: state.roleId });
      } else {
        await api.insertRole(params);
      }
      showMessage(`${state.title}成功`, "success");
      onClose?.("submit");
    } finally {
      dispatch({ type: "ADD_ROLE_LOADING", addRoleLoading: false });
    }
  };

  const onMenuCheck: TreeProps<RoleMenuTreeNode>["onCheck"] = (checkedKeys) => {
    const keys = Array.isArray(checkedKeys) ? checkedKeys : checkedKeys.checked;
    setSelectedMenuKeys(keys);
  };

  useEffect(() => {
    const init = async () => {
      await loadMenuTree();
      isEdit && getDetail();
    };
    init();
  }, []);

  return (
    <BasicDialog open={state.visible} title={state.title} width={1000} confirmLoading={state.addRoleLoading} loading={state.loading} onOk={handleSubmit} onCancel={() => onClose?.()}>
      <Row gutter={16}>
        <Col span={11}>
          <Card title="基本信息" size="small" className="[&_.ant-card-body]:p-3">
            <BasicForm
              formConfig={formConfig}
              otherFormConfig={{
                labelCol: ROLE_FORM_LABEL_COL,
                wrapperCol: ROLE_FORM_WRAPPER_COL,
                labelAlign: "right",
                colon: true,
                size: "middle",
                form,
                initialValues: { status: true, roleSort: 0 },
              }}
            />
          </Card>
        </Col>
        <Col span={13}>
          <Card title="菜单权限" size="small" className="[&_.ant-card-body]:p-3">
            <Spin spinning={treeLoading}>
              <div className="overflow-auto rounded border border-[#f0f0f0] bg-[#fafafa] p-2" style={{ height: MENU_TREE_HEIGHT }}>
                <Tree<RoleMenuTreeNode>
                  checkable
                  defaultExpandAll
                  checkedKeys={selectedMenuKeys}
                  fieldNames={{ title: "menuName", key: "menuId", children: "children" }}
                  treeData={treeData}
                  onCheck={onMenuCheck}
                />
              </div>
            </Spin>
          </Card>
        </Col>
      </Row>
    </BasicDialog>
  );
}
