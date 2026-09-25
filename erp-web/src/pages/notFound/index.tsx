import React from "react";
import { Result } from "antd";

const NotFound = () => {
  return (
    <Result
      className="flex h-full min-h-0 flex-col items-center justify-center [&_.ant-result-image]:!m-0"
      status="404"
      title="404"
      subTitle="Sorry, the page you visited does not exist."
    />
  );
};

export default NotFound;