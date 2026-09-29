package com.erp.system.domain.dto;

import com.alibaba.excel.annotation.ExcelProperty;
import com.erp.common.annotation.Excel;

/**
 * 客户资料 Excel 导入/导出模型
 */
public class CustomerExcelDTO {

    @Excel(name = "客户名称", required = true, sort = 1)
    @ExcelProperty("客户名称")
    private String customerName;

    @Excel(name = "客户简称", required = true, sort = 2)
    @ExcelProperty("客户简称")
    private String shortName;

    @Excel(name = "省", required = true, sort = 3)
    @ExcelProperty("省")
    private String province;

    @Excel(name = "市", required = true, sort = 4)
    @ExcelProperty("市")
    private String city;

    @Excel(name = "公司地址", required = true, sort = 5)
    @ExcelProperty("公司地址")
    private String address;

    @Excel(name = "信用等级", required = true, sort = 6, dictType = "customer_credit_level")
    @ExcelProperty("信用等级")
    private String creditLevel;

    @Excel(name = "客户分类", required = true, sort = 7, dictType = "customer_category")
    @ExcelProperty("客户分类")
    private String category;

    @Excel(name = "开户行", required = true, sort = 8)
    @ExcelProperty("开户行")
    private String bankName;

    @Excel(name = "开票地址", required = true, sort = 9)
    @ExcelProperty("开票地址")
    private String invoiceAddress;

    @Excel(name = "银行账号", required = true, sort = 10)
    @ExcelProperty("银行账号")
    private String bankAccount;

    @Excel(name = "税号", required = true, sort = 11)
    @ExcelProperty("税号")
    private String taxNumber;

    @Excel(name = "联系人", required = true, sort = 12)
    @ExcelProperty("联系人")
    private String contactPerson;

    @Excel(name = "联系人电话", required = true, sort = 13, pattern = "^1[3-9]\\d{9}$", patternMessage = "联系人电话格式不正确")
    @ExcelProperty("联系人电话")
    private String contactPhone;

    @Excel(name = "备注", sort = 14, type = Excel.Type.EXPORT)
    private String remark;

    public String getCustomerName() {
        return customerName;
    }

    public void setCustomerName(String customerName) {
        this.customerName = customerName;
    }

    public String getShortName() {
        return shortName;
    }

    public void setShortName(String shortName) {
        this.shortName = shortName;
    }

    public String getProvince() {
        return province;
    }

    public void setProvince(String province) {
        this.province = province;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getCreditLevel() {
        return creditLevel;
    }

    public void setCreditLevel(String creditLevel) {
        this.creditLevel = creditLevel;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getBankName() {
        return bankName;
    }

    public void setBankName(String bankName) {
        this.bankName = bankName;
    }

    public String getInvoiceAddress() {
        return invoiceAddress;
    }

    public void setInvoiceAddress(String invoiceAddress) {
        this.invoiceAddress = invoiceAddress;
    }

    public String getBankAccount() {
        return bankAccount;
    }

    public void setBankAccount(String bankAccount) {
        this.bankAccount = bankAccount;
    }

    public String getTaxNumber() {
        return taxNumber;
    }

    public void setTaxNumber(String taxNumber) {
        this.taxNumber = taxNumber;
    }

    public String getContactPerson() {
        return contactPerson;
    }

    public void setContactPerson(String contactPerson) {
        this.contactPerson = contactPerson;
    }

    public String getContactPhone() {
        return contactPhone;
    }

    public void setContactPhone(String contactPhone) {
        this.contactPhone = contactPhone;
    }

    public String getRemark() {
        return remark;
    }

    public void setRemark(String remark) {
        this.remark = remark;
    }
}
