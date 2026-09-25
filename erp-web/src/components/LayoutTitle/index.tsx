import { DownOutlined, UpOutlined } from "@ant-design/icons";
import { Card } from "antd";
import { JSX, useState } from "react";
import { createUseStyles } from "react-jss";
const useStyles = createUseStyles({
  before: {
    display: "flex",
    alignItems: "stretch",
    fontWeight: "bold",
    "&::before": {
      content: '""',
      display: "block",
      width: 6,
      flexShrink: 0,
      background: "rgba(4, 104, 255, 1)",
      marginRight: 6,
      borderRadius: 8,
    },
  },
});
export default function LayoutTitle(props: { title: string; children: JSX.Element; isShow?: boolean }) {
  const { title, children, isShow = true } = props;
  const classes = useStyles();
  const [open, setOpen] = useState(true);
  return (
    <Card className="mb-2.5">
      <div className="flex justify-between mb-5">
        <div className={`${classes.before} flex-1`}> {title} </div>
        {isShow && (
          <div
            className="cursor-pointer"
            onClick={() => {
              setOpen(!open);
            }}
          >
            <span className="mr-2">{open ? "收起" : "展开"}</span>
            {open ? <UpOutlined /> : <DownOutlined />}
          </div>
        )}
      </div>
      {open && children}
    </Card>
  );
}
