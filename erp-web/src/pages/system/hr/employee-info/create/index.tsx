import BasicForm from "@/components/BasicForm";
import LayoutTitle from "@/components/LayoutTitle";
import { Cascader, DatePicker, Input, Radio, Select, Space } from "antd";
import { documentType, educationType, maritalStatusType, politicalStatusType, userSatusType } from "./contsant";
import UploadFile from "@/components/UploadFile";
import { PlusOutlined } from "@ant-design/icons";
import ContentSection from "@/components/ContentSection";
import { regionData } from "element-china-area-data";
import BasicButton from "@/components/BasicButton";
import { useEffect } from "react";
import dayjs from "dayjs";
import { getBirthdayToAge } from "@/utils/methods";
import { FormConfig } from "@/interface";
interface CreateEmployeeInfoProps {}
export default function CreateEmployeeInfo() {
  const baseFormConfig: FormConfig[] = [
    {
      formItemProps: {
        label: "员工照片",
        name: "employeePhoto",
        rules: [{ required: true, message: "请选择照片" }],
        valuePropName: "fileList",
        getValueFromEvent: (e: { fileList: any }) => {
          if (Array.isArray(e)) return e;
          return e?.fileList;
        },
      },
      component: (
        <UploadFile listType="picture-card" withCredentials maxCount={1} accept="image/*">
          <PlusOutlined />
        </UploadFile>
      ),
      colProps: { sm: 24 },
    },
    {
      formItemProps: { label: "员工工号", name: "employeeNo", type: "text" },
      component: <Input disabled />,
      colProps: { xl: 8, lg: 12, sm: 24 },
    },
    {
      formItemProps: { label: "员工姓名", name: "userName", rules: [{ required: true, message: "请输入员工姓名" }], type: "text" },
      component: <Input placeholder="请输入员工姓名" allowClear />,
      colProps: { xl: 8, lg: 12, sm: 24 },
    },
    {
      formItemProps: { label: "性别", name: "sex", rules: [{ required: true, message: "请选择性别" }] },
      component: (
        <Radio.Group>
          <Radio value="male">男</Radio>
          <Radio value="female">女</Radio>
        </Radio.Group>
      ),
      colProps: { xl: 8, lg: 12, sm: 24 },
    },
    {
      formItemProps: {
        label: "出生日期",
        name: "birthDate",
        rules: [{ required: true, message: "请选择出生日期" }],
        getValueFromEvent: (v: { format: (arg0: string) => any }) => (v ? v.format("YYYY-MM-DD") : undefined),
        getValueProps: (v: string | number | Date | dayjs.Dayjs | null | undefined) => ({
          value: v ? dayjs(v) : undefined,
        }),
      },
      component: <DatePicker className="w-full" format="YYYY-MM-DD" />,
      colProps: { xl: 8, lg: 12, sm: 24 },
    },
    {
      formItemProps: { label: "年龄", name: "age", rules: [{ required: true, message: "请输入年龄" }] },
      component: <Input className="w-full" placeholder="请输入年龄" disabled></Input>,
      colProps: { xl: 8, lg: 12, sm: 24 },
    },

    {
      formItemProps: { label: "民族", name: "ethnicity", rules: [{ required: true, message: "请选择民族" }] },
      component: (
        <Select placeholder="请选择民族">
          {documentType.map((item) => (
            <Select.Option key={item.value} value={item.value}>
              {item.label}
            </Select.Option>
          ))}
        </Select>
      ),
      colProps: { xl: 8, lg: 12, sm: 24 },
    },
    {
      formItemProps: { label: "政治面貌", name: "politicalStatus", rules: [{ required: true, message: "请选择政治面貌" }] },
      component: (
        <Select placeholder="请选择政治面貌">
          {politicalStatusType.map((item) => (
            <Select.Option key={item.value} value={item.value}>
              {item.label}
            </Select.Option>
          ))}
        </Select>
      ),
      colProps: { xl: 8, lg: 12, sm: 24 },
    },
    {
      formItemProps: { label: "婚姻状况", name: "maritalStatus", rules: [{ required: true, message: "请选择婚姻状况" }] },
      component: (
        <Select placeholder="请选择婚姻状况">
          {maritalStatusType.map((item) => (
            <Select.Option key={item.value} value={item.value}>
              {item.label}
            </Select.Option>
          ))}
        </Select>
      ),
      colProps: { xl: 8, lg: 12, sm: 24 },
    },
    {
      formItemProps: { label: "学历", name: "education", rules: [{ required: true, message: "请选择学历" }] },
      component: (
        <Select placeholder="请选择学历">
          {educationType.map((item) => (
            <Select.Option key={item.value} value={item.value}>
              {item.label}
            </Select.Option>
          ))}
        </Select>
      ),
      colProps: { xl: 8, lg: 12, sm: 24 },
    },
    {
      formItemProps: { label: "证件类型", name: "documentType", rules: [{ required: true, message: "请选择证件类型" }] },
      component: (
        <Select placeholder="请选择证件类型">
          {documentType.map((item) => (
            <Select.Option key={item.value} value={item.value}>
              {item.label}
            </Select.Option>
          ))}
        </Select>
      ),
      colProps: { xl: 8, lg: 12, sm: 24 },
    },
    {
      formItemProps: { label: "证件号", name: "documentNumber", rules: [{ required: true, message: "请输入证件号" }], type: "text" },
      component: <Input placeholder="请输入证件号" allowClear />,
      colProps: { xl: 8, lg: 12, sm: 24 },
    },
    {
      formItemProps: { label: "联系电话", name: "phone", rules: [{ required: true, message: "请输入联系电话" }], type: "text" },
      component: <Input placeholder="请输入联系电话" allowClear />,
      colProps: { xl: 8, lg: 12, sm: 24 },
    },

    {
      formItemProps: { label: "现住地址", name: "currentAddress", rules: [{ required: true, message: "请选择现住地址" }] },
      component: <Cascader options={regionData} placeholder="请选择现住地址" />,
      colProps: { xl: 8, lg: 12, sm: 24 },
    },
    {
      formItemProps: { label: "毕业院校", name: "graduationSchool", type: "text" },
      component: <Input className="w-full" placeholder="请输入毕业院校" disabled></Input>,
      colProps: { xl: 8, lg: 12, sm: 24 },
    },
    {
      formItemProps: { label: "户口地址", name: "hrAdress" },
      component: <Cascader options={regionData} placeholder="请选择户口地址" />,
      colProps: { xl: 8, lg: 12, sm: 24 },
    },
    {
      formItemProps: { label: "现住详细地址", name: "currentDetailedAddress", rules: [{ required: true, message: "请输入现住详细地址" }], type: "text" },
      component: <Input.TextArea placeholder="请输入现住详细地址" allowClear cols={2} autoCapitalize="none" />,
      colProps: { xl: 24 },
    },
    {
      formItemProps: { label: "户口详细地址", name: "hrDetailedAddress", rules: [{ required: true, message: "请输入户口详细地址" }], type: "text" },
      component: <Input.TextArea placeholder="请输入户口详细地址" allowClear />,
      colProps: { xl: 24 },
    },
  ];
  const dossierFormConfig = [
    {
      formItemProps: { label: "部门", name: "deptId", rules: [{ required: true, message: "请选择部门" }] },
      component: (
        <Select placeholder="请选择部门">
          {documentType.map((item) => (
            <Select.Option key={item.value} value={item.value}>
              {item.label}
            </Select.Option>
          ))}
        </Select>
      ),
      colProps: { xl: 8, lg: 12, sm: 24 },
    },
    {
      formItemProps: { label: "岗位", name: "postId", rules: [{ required: true, message: "请选择岗位" }] },
      component: (
        <Select placeholder="请选择岗位">
          {documentType.map((item) => (
            <Select.Option key={item.value} value={item.value}>
              {item.label}
            </Select.Option>
          ))}
        </Select>
      ),
      colProps: { xl: 8, lg: 12, sm: 24 },
    },
    {
      formItemProps: { label: "入职日期", name: "hireDate", rules: [{ required: true, message: "请选择入职日期" }] },
      component: <DatePicker className="w-full" />,
      colProps: { xl: 8, lg: 12, sm: 24 },
    },
    {
      formItemProps: { label: "员工状态", name: "userStatus" },
      component: (
        <Select placeholder="请选择员工状态">
          {userSatusType.map((item) => (
            <Select.Option key={item.value} value={item.value}>
              {item.label}
            </Select.Option>
          ))}
        </Select>
      ),
      colProps: { xl: 8, lg: 12, sm: 24 },
    },
    {
      formItemProps: {
        label: "岗位证书",
        name: "jobFile",
        valuePropName: "fileList",
        getValueFromEvent: (e: { fileList: any }) => {
          if (Array.isArray(e)) return e;
          return e?.fileList;
        },
      },
      component: (
        <UploadFile listType="picture-card" withCredentials accept="image/*">
          <PlusOutlined />
        </UploadFile>
      ),
      colProps: { sm: 24 },
    },
  ];
  const [baseForm] = BasicForm.useForm<CreateEmployeeInfoProps>();
  const [dossierForm] = BasicForm.useForm<CreateEmployeeInfoProps>();
  const birthDate = BasicForm.useWatch("birthDate", baseForm);
  useEffect(() => {
    baseForm.setFieldValue("age", getBirthdayToAge(birthDate));
  }, [birthDate]);
  return (
    <ContentSection>
      <ContentSection.Content>
        <LayoutTitle title="员工信息">
          <BasicForm
            formConfig={baseFormConfig}
            otherFormConfig={{
              labelCol: { flex: "110px" },
              wrapperCol: { flex: 1 },
              form: baseForm,
            }}
          />
        </LayoutTitle>
        <LayoutTitle title="档案信息">
          <BasicForm
            formConfig={dossierFormConfig}
            otherFormConfig={{
              labelCol: { flex: "110px" },
              wrapperCol: { flex: 1 },
              form: dossierForm,
            }}
          />
        </LayoutTitle>
      </ContentSection.Content>
      <ContentSection.Footer>
        <Space>
          <BasicButton size="middle">关闭</BasicButton>
          <BasicButton type="primary" size="middle">
            提交
          </BasicButton>
        </Space>
      </ContentSection.Footer>
    </ContentSection>
  );
}
