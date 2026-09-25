import { SaveOutlined } from "@ant-design/icons";
import { Key, useCallback, useEffect, useMemo, useRef } from "react";
import MyDialog from "@/components/BasicDialog";
import AntButton from "@/components/BasicButton";
import { Card, Input, type TableColumnsType } from "antd";
import SearchBox from "@/components/SearchBox";
import BasicTable from "@/components/BasicTable";
import api from "@/api";
import { useRoleStore } from "./useRoleProvider";
import { showMessage } from "@/utils/methods";
import { FormConfig } from "@/interface";

const PANEL_HEIGHT = 420;

interface AuthUserTableData {
  userId: string | number;
  account: string;
  nickName: string;
}

export default function AuthConfig(props: { onClose: () => void }) {
  const { onClose } = props;
  const searchRef = useRef<any>(null);
  const tableRef = useRef<any>(null);
  const { state, dispatch } = useRoleStore();

  const formConfig = useMemo(
    (): FormConfig[] => [
      {
        formItemProps: { label: "账号", name: "account", wrapperCol: { span: 22 }, type: "text" },
        component: <Input allowClear placeholder="请输入账号" />,
      },
      {
        formItemProps: { label: "昵称", name: "nickName", wrapperCol: { span: 22 }, type: "text" },
        component: <Input allowClear placeholder="请输入昵称" />,
      },
    ],
    [],
  );

  const columns: TableColumnsType<AuthUserTableData> = useMemo(
    () => [
      { title: "账号", dataIndex: "account", key: "account", ellipsis: true },
      { title: "昵称", dataIndex: "nickName", key: "nickName", ellipsis: true },
    ],
    [],
  );

  const dialogTitle = state.roleName ? `分配用户 - ${state.roleName}` : "分配用户";

  const loadUserConfig = useCallback(async () => {
    if (!state.roleId) return;
    try {
      const res = await api.getUserConfig({ roleId: state.roleId });
      const page = (res?.data ?? res) as { records?: { userId: string | number }[] };
      const records = Array.isArray(page?.records) ? page.records : Array.isArray(res?.data) ? (res.data as { userId: string | number }[]) : [];
      dispatch({
        type: "SET_SELECTED_USER_KEYS",
        selectedUserKeys: records.map((v) => String(v.userId)),
      });
    } catch {
      dispatch({ type: "SET_SELECTED_USER_KEYS", selectedUserKeys: [] });
    }
  }, [dispatch, state.roleId]);

  useEffect(() => {
    void loadUserConfig();
  }, [loadUserConfig]);

  const handleSubmitUser = async () => {
    if (!state.selectedUserKeys?.length) {
      return showMessage("请选择用户", "warning");
    }
    dispatch({ type: "SUBMIT_USER_LOADING", userCofirmloading: true });
    try {
      await api.setUserConfig({
        roleId: state.roleId,
        userList: state.selectedUserKeys,
      });
      showMessage("用户分配保存成功", "success");
      onClose?.();
    } finally {
      dispatch({ type: "SUBMIT_USER_LOADING", userCofirmloading: false });
    }
  };

  const selectedRow = (selectedRowKeys: Key[]) => {
    dispatch({ type: "SET_SELECTED_USER_KEYS", selectedUserKeys: selectedRowKeys });
  };

  return (
    <MyDialog open={state.permissionVisible} title={dialogTitle} width={760} footer={null} onCancel={() => onClose?.()}>
      <Card size="small" className="[&_.ant-card-body]:flex [&_.ant-card-body]:min-h-0 [&_.ant-card-body]:flex-col">
        <SearchBox formConfig={formConfig} ref={searchRef} fieldsPerRow={2} onSearch={() => tableRef.current?.getTableData()} />
        <div className="min-h-0 flex-1" style={{ height: PANEL_HEIGHT }}>
          <BasicTable<AuthUserTableData>
            ref={tableRef}
            columns={columns}
            callback={api.getUserList}
            isAutoResize={false}
            isShowPage
            otherTableProps={{
              rowKey: "userId",
              size: "small",
              rowSelection: {
                type: "checkbox",
                selectedRowKeys: state.selectedUserKeys,
                preserveSelectedRowKeys: true,
                onChange: selectedRow,
              },
            }}
            onGetParams={() => searchRef.current?.getFieldsValue(true)}
          />
        </div>
        <div className="mt-3 flex justify-end">
          <AntButton type="primary" icon={<SaveOutlined />} loading={state.userCofirmloading} onClick={handleSubmitUser}>
            保存
          </AntButton>
        </div>
      </Card>
    </MyDialog>
  );
}
