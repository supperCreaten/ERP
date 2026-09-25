import { useState } from "react";
import { DeleteOutlined, DownloadOutlined } from "@ant-design/icons";
import { DatePicker, Input, Select, Tag, type TableColumnProps, type TableProps } from "antd";
import type { AnyObject } from "antd/es/_util/type";
import type { Dayjs } from "dayjs";
import type { Key } from "react";
import SearchBox from "@/components/SearchBox";
import BasicTable, { useBasicTable } from "@/components/BasicTable";
import TableSection from "@/components/TableSection";
import AntButton from "@/components/BasicButton";
import TableOperation, { TABLE_LINK_BTN_CLASS } from "@/components/TableOperation";
import api from "@/api";
import { showMessage } from "@/utils/methods";
import { modal } from "@/utils/static-antd";
import LoginLogDetail, { type LoginLogDetailData } from "./compontent/loginLogDetail";
import { unwrapData, unwrapDataWith } from "@/utils/apiResponse";
import { FormConfig } from "@/interface";

function LoginLogPage() {
  const { searchRef, onTableReady, onSearch, refreshTable } = useBasicTable();
  const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>([]);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detail, setDetail] = useState<LoginLogDetailData | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const formConfig: FormConfig[] = [
    {
      colProps: { xl: 8, lg: 12, md: 24, sm: 24, xs: 24 },
      formItemProps: { label: "登录地址", name: "ipaddr", type: "text" },
      component: <Input allowClear placeholder="请输入登录地址" />,
    },
    {
      colProps: { xl: 8, lg: 12, md: 24, sm: 24, xs: 24 },
      formItemProps: { label: "用户名称", name: "userName", type: "text" },
      component: <Input allowClear placeholder="请输入用户名称" />,
    },
    {
      colProps: { xl: 8, lg: 12, md: 24, sm: 24, xs: 24 },
      formItemProps: { label: "状态", name: "status" },
      component: (
        <Select allowClear placeholder="操作状态">
          <Select.Option value={0}>成功</Select.Option>
          <Select.Option value={1}>失败</Select.Option>
        </Select>
      ),
    },
    {
      colProps: { xl: 8, lg: 12, md: 24, sm: 24, xs: 24 },
      formItemProps: { label: "客户端", name: "clientType" },
      component: (
        <Select allowClear placeholder="客户端类型">
          <Select.Option value="web">管理端</Select.Option>
          <Select.Option value="app">App端</Select.Option>
        </Select>
      ),
    },
    {
      colProps: { xl: 8, lg: 12, md: 24, sm: 24, xs: 24 },
      formItemProps: { label: "登录时间", name: "loginTimeRange" },
      component: <DatePicker.RangePicker allowClear style={{ width: "100%" }} showTime />,
    },
  ];

  const columns: TableColumnProps[] = [
    {
      title: "访问编号",
      dataIndex: "infoId",
      key: "infoId",
      width: 100,
      align: "center",
    },
    {
      title: "用户名称",
      dataIndex: "userName",
      key: "userName",
      align: "center",
      ellipsis: true,
    },
    {
      title: "地址",
      dataIndex: "ipaddr",
      key: "ipaddr",
      align: "center",
      ellipsis: true,
    },
    {
      title: "登录地点",
      dataIndex: "loginLocation",
      key: "loginLocation",
      align: "center",
      ellipsis: true,
    },
    {
      title: "操作系统",
      dataIndex: "os",
      key: "os",
      align: "center",
      ellipsis: true,
    },
    {
      title: "浏览器",
      dataIndex: "browser",
      key: "browser",
      align: "center",
      ellipsis: true,
    },
    {
      title: "客户端",
      dataIndex: "clientType",
      key: "clientType",
      width: 96,
      align: "center",
      render: (clientType: string) => (clientType === "app" ? <Tag color="purple">App端</Tag> : <Tag color="blue">管理端</Tag>),
    },
    {
      title: "登录状态",
      dataIndex: "status",
      key: "status",
      width: 96,
      align: "center",
      render: (status: string) => (status === "0" ? <Tag color="processing">成功</Tag> : <Tag color="error">失败</Tag>),
    },
    {
      title: "描述",
      dataIndex: "msg",
      key: "msg",
      ellipsis: true,
      align: "center",
    },
    {
      title: "访问时间",
      dataIndex: "loginTime",
      key: "loginTime",
      width: 170,
      align: "center",
    },
    {
      title: "操作",
      dataIndex: "operation",
      key: "operation",
      width: 88,
      fixed: "right",
      align: "center",
      render: (_text, record: AnyObject) => (
        <TableOperation>
          <AntButton type="link" className={TABLE_LINK_BTN_CLASS} onClick={() => void openDetail(record?.infoId)}>
            详情
          </AntButton>
        </TableOperation>
      ),
    },
  ];

  const openDetail = async (infoId: number) => {
    setDetailOpen(true);
    setDetailLoading(true);
    setDetail(null);
    try {
      const res = await api.getLoginLogDetail({ infoId });
      setDetail((unwrapData(res) ?? null) as LoginLogDetailData | null);
    } catch {
      setDetailOpen(false);
    } finally {
      setDetailLoading(false);
    }
  };

  const onGetParams = () => {
    const values = searchRef.current?.getFieldsValue(true) ?? {};
    const range = values.loginTimeRange as [Dayjs, Dayjs] | undefined;
    const { loginTimeRange: _omit, ...rest } = values;
    return {
      ...rest,
      beginTime: range?.[0]?.format("YYYY-MM-DD HH:mm:ss"),
      endTime: range?.[1]?.format("YYYY-MM-DD HH:mm:ss"),
    };
  };

  const handleDelete = (record?: AnyObject) => {
    const ids = record?.infoId ? [record.infoId] : selectedRowKeys;
    if (!ids.length) {
      showMessage("请选择要删除的记录", "warning");
      return;
    }
    modal.confirm({
      title: "提示",
      content: `是否确认删除选中的 ${ids.length} 条登录日志？`,
      cancelText: "取消",
      okText: "确定",
      onOk: async () => {
        try {
          await api.deleteLoginLog({ infoIds: ids as (number | string)[] });
          showMessage("删除成功", "success");
          setSelectedRowKeys([]);
          refreshTable();
        } catch {
          /* 请求层已提示 */
        }
      },
    });
  };

  const handleClean = () => {
    modal.confirm({
      title: "提示",
      content: "将删除 30 天前的登录日志，确定继续吗？",
      cancelText: "取消",
      okText: "确定",
      onOk: async () => {
        try {
          await api.cleanLoginLog({ days: 30 });
          showMessage("清空成功", "success");
          refreshTable();
        } catch {
          /* 请求层已提示 */
        }
      },
    });
  };

  const handleExport = () => {
    showMessage("导出功能开发中", "info");
  };

  const rowSelection: TableProps["rowSelection"] = {
    selectedRowKeys,
    onChange: (keys) => setSelectedRowKeys(keys),
  };

  return (
    <TableSection>
      <TableSection.Header>
        <SearchBox formConfig={formConfig} ref={searchRef} onSearch={onSearch} />
      </TableSection.Header>
      <TableSection.Content>
        <BasicTable
          columns={columns}
          onTableReady={onTableReady}
          callback={api.getLoginLogList}
          rowKey="infoId"
          otherTableProps={{
            rowSelection,
            scroll: { x: 1200 },
          }}
          onGetParams={onGetParams}
        >
          <BasicTable.ToolbarRight>
            <AntButton danger icon={<DeleteOutlined />} onClick={() => handleDelete()}>
              删除
            </AntButton>
            <AntButton color="default" onClick={handleClean}>
              清空日志
            </AntButton>
            <AntButton className="border-orange-400 text-orange-500" icon={<DownloadOutlined />} onClick={handleExport}>
              导出
            </AntButton>
          </BasicTable.ToolbarRight>
        </BasicTable>
      </TableSection.Content>
      {detailOpen ? <LoginLogDetail open={detailOpen} loading={detailLoading} detail={detail} onClose={() => setDetailOpen(false)} /> : null}
    </TableSection>
  );
}

export default LoginLogPage;
