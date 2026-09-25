import { useState } from "react";
import SearchBox from "@/components/SearchBox";
import BasicTable, { useBasicTable } from "@/components/BasicTable";
import TableSection from "@/components/TableSection";
import api from "@/api";
import AntButton from "@/components/BasicButton";
import { DatePicker, Input, Select, TableColumnProps } from "antd";
import { AnyObject } from "antd/es/_util/type";
import { showMessage } from "@/utils/methods";
import { modal } from "@/utils/static-antd";
import type { Dayjs } from "dayjs";
import OperLogDetail, { type OperLogDetailData } from "./compontent/operLogDetail";
import TableOperation, { TABLE_LINK_BTN_CLASS } from "@/components/TableOperation";
import { unwrapData, unwrapDataWith } from "@/utils/apiResponse";
import { FormConfig } from "@/interface";

const businessTypeRecord: Record<number, string> = {
  0: "其它",
  1: "新增",
  2: "修改",
  3: "删除",
  4: "授权",
  5: "导出",
  6: "导入",
  7: "强退",
  8: "生成代码",
  9: "清空",
};

function OperationLog() {
  const { searchRef, onTableReady, onSearch, refreshTable } = useBasicTable();
  const [detailOpen, setDetailOpen] = useState(false);
  const [detail, setDetail] = useState<OperLogDetailData | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const formConfig: FormConfig[] = [
    {
      colProps: { xl: 8, lg: 12, md: 24, sm: 24, xs: 24 },
      formItemProps: {
        label: "模块标题",
        name: "title",
        type: "text",
      },
      component: <Input allowClear placeholder="请输入模块标题" />,
    },
    {
      colProps: { xl: 8, lg: 12, md: 24, sm: 24, xs: 24 },
      formItemProps: {
        label: "操作人员",
        name: "operName",
        type: "text",
      },
      component: <Input allowClear placeholder="请输入操作人员" />,
    },
    {
      colProps: { xl: 8, lg: 12, md: 24, sm: 24, xs: 24 },
      formItemProps: {
        label: "业务类型",
        name: "businessType",
      },
      component: (
        <Select allowClear placeholder="请选择">
          {Object.entries(businessTypeRecord).map(([value, label]) => (
            <Select.Option key={value} value={parseFloat(value)}>
              {label}
            </Select.Option>
          ))}
        </Select>
      ),
    },
    {
      colProps: { xl: 8, lg: 12, md: 24, sm: 24, xs: 24 },
      formItemProps: {
        label: "操作状态",
        name: "status",
      },
      component: (
        <Select allowClear placeholder="请选择">
          <Select.Option value={0}>成功</Select.Option>
          <Select.Option value={1}>失败</Select.Option>
        </Select>
      ),
    },
    {
      colProps: { xl: 8, lg: 12, md: 24, sm: 24, xs: 24 },
      formItemProps: {
        label: "操作时间",
        name: "operTimeRange",
      },
      component: <DatePicker.RangePicker allowClear style={{ width: "100%" }} />,
    },
  ];

  const columns: TableColumnProps[] = [
    {
      title: "序号",
      width: 80,
      align: "center",
      render: (_text, _record, index) => index + 1,
    },
    {
      title: "模块标题",
      dataIndex: "title",
      key: "title",
      align: "center",
      ellipsis: true,
    },
    {
      title: "业务类型",
      dataIndex: "businessType",
      key: "businessType",
      align: "center",
      render: (text: number) => businessTypeRecord[text] ?? "其它",
    },
    {
      title: "请求方式",
      dataIndex: "requestMethod",
      key: "requestMethod",
      align: "center",
    },
    {
      title: "操作人员",
      dataIndex: "operName",
      key: "operName",
      align: "center",
    },
    {
      title: "请求地址",
      dataIndex: "operUrl",
      key: "operUrl",
      ellipsis: true,
      align: "center",
    },
    {
      title: "主机地址",
      dataIndex: "operIp",
      key: "operIp",
      align: "center",
    },
    {
      title: "操作状态",
      dataIndex: "status",
      key: "status",
      align: "center",
      render: (text: number) => (text === 0 ? "成功" : "失败"),
    },
    {
      title: "耗时(ms)",
      dataIndex: "costTime",
      key: "costTime",
      align: "center",
    },
    {
      title: "操作时间",
      dataIndex: "operTime",
      key: "operTime",
      align: "center",
      width: 170,
    },
    {
      title: "操作",
      dataIndex: "operation",
      key: "operation",
      align: "center",
      render: (_text, record: AnyObject) => (
        <TableOperation>
          <AntButton type="link" className={TABLE_LINK_BTN_CLASS} onClick={() => void openDetail(record?.operId)}>
            详情
          </AntButton>
        </TableOperation>
      ),
    },
  ];

  const openDetail = async (operId: number) => {
    setDetailOpen(true);
    setDetailLoading(true);
    setDetail(null);
    try {
      const res = await api.getOperLogDetail({ operId });
      setDetail((unwrapData(res) ?? null) as OperLogDetailData | null);
    } catch {
      setDetailOpen(false);
    } finally {
      setDetailLoading(false);
    }
  };

  const onGetParams = () => {
    const values = searchRef.current?.getFieldsValue(true) ?? {};
    const range = values.operTimeRange as [Dayjs, Dayjs] | undefined;
    const { operTimeRange: _omit, ...rest } = values;
    return {
      ...rest,
      beginTime: range?.[0]?.format("YYYY-MM-DD HH:mm:ss"),
      endTime: range?.[1]?.format("YYYY-MM-DD HH:mm:ss"),
    };
  };

  const handleClean = () => {
    modal.confirm({
      title: "提示",
      content: "将删除 30 天前的操作日志，确定继续吗？",
      cancelText: "取消",
      okText: "确定",
      onOk: async () => {
        try {
          await api.cleanOperLog({ days: 30 });
          showMessage("清理成功", "success");
          refreshTable();
        } catch {
          /* 拦截器已提示 */
        }
      },
      onCancel: () => {},
    });
  };

  return (
    <TableSection>
      <TableSection.Header>
        <SearchBox formConfig={formConfig} ref={searchRef} onSearch={onSearch} />
      </TableSection.Header>
      <TableSection.Content>
        <BasicTable columns={columns} onTableReady={onTableReady} callback={api.getOperLogList} rowKey="operId" onGetParams={onGetParams}>
          <BasicTable.ToolbarRight>
            <AntButton danger onClick={handleClean}>
              清空
            </AntButton>
          </BasicTable.ToolbarRight>
        </BasicTable>
      </TableSection.Content>
      {detailOpen && <OperLogDetail open={detailOpen} loading={detailLoading} detail={detail} onClose={() => setDetailOpen(false)} />}
    </TableSection>
  );
}

export default OperationLog;
