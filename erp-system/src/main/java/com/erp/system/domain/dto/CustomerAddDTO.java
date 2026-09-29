package com.erp.system.domain.dto;

import com.erp.common.core.domain.BaseEntity;
import jakarta.validation.constraints.NotBlank;

import java.util.List;

/**
 * 客户新增参数
 */
public class CustomerAddDTO extends BaseEntity {
    private static final long serialVersionUID = 1L;

    /**
     * 客户ID（修改时使用；新增时由数据库回填）
     */
    private Long customerId;

    /**
     * 客户名称
     */
    @NotBlank(message = "客户名称不能为空")
    private String customerName;

    /**
     * 简称
     */
    @NotBlank(message = "客户名称不能为空")
    private String shortName;

    /**
     * 所属省/市
     */

    private List<String> region;

    /**
     * 省
     */

    private String province;

    /**
     * 市
     */

    private String city;
    /**
     * 公司地址
     */
    private String address;

    /**
     * 邮编
     */
    private String zipCode;

    /**
     * 信用等级
     */
    @NotBlank(message = "信用等级不能为空")
    private String creditLevel;

    /**
     * 客户分类
     */
    @NotBlank(message = "客户分类不能为空")
    private String category;

    /**
     * 开户行
     */
    @NotBlank(message = "开户行不能为空")
    private String bankName;
    /**
     * 开户地址
     */
    @NotBlank(message = "开票地址不能为空")
    private String invoiceAddress;

    /**
     * 银行账号
     */
    @NotBlank(message = "银行账号不能为空")
    private String bankAccount;

    /**
     * 税号
     */
    @NotBlank(message = "税号不能为空")
    private String taxNumber;

    /**
     * 业务联系人
     */
    @NotBlank(message = "业务联系人不能为空")
    private String contactPerson;

    /**
     * 联系电话
     */
    @NotBlank(message = "联系电话不能为空")
    private String contactPhone;

    public Long getCustomerId() {
        return customerId;
    }

    public void setCustomerId(Long customerId) {
        this.customerId = customerId;
    }

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

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getZipCode() {
        return zipCode;
    }

    public void setZipCode(String zipCode) {
        this.zipCode = zipCode;
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

    public List<String> getRegion() {
        return region;
    }

    public void setRegion(List<String> region) {
        this.region = region;
    }

    public String getInvoiceAddress() {
        return invoiceAddress;
    }

    public void setInvoiceAddress(String invoiceAddress) {
        this.invoiceAddress = invoiceAddress;
    }
}
