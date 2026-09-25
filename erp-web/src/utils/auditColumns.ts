import type { TableColumnsType } from "antd";
import type { AnyObject } from "antd/es/_util/type";

const renderCell = (text: string) => text || "—";

/** 列表审计字段列：创建人/时间、修改人/时间 */
export function createAuditColumns<T extends AnyObject = AnyObject>(
  options?: { create?: boolean; update?: boolean },
): TableColumnsType<T> {
  const { create = true, update = true } = options ?? {};
  const columns: TableColumnsType<T> = [];
  if (create) {
    columns.push(
      {
        title: "创建人",
        dataIndex: "createBy",
        key: "createBy",
        width: 130,
        ellipsis: true,
        align: "center",
        render: renderCell,
      },
      {
        title: "创建时间",
        dataIndex: "createTime",
        key: "createTime",
        width: 168,
        align: "center",
        render: renderCell,
      },
    );
  }

  if (update) {
    columns.push(
      {
        title: "修改人",
        dataIndex: "updateBy",
        key: "updateBy",
        width: 100,
        ellipsis: true,
        align: "center",
        render: renderCell,
      },
      {
        title: "修改时间",
        dataIndex: "updateTime",
        key: "updateTime",
        width: 168,
        align: "center",
        render: renderCell,
      },
    );
  }

  return columns;
}
