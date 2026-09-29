package com.erp.system.domain.dto;

import com.erp.common.core.domain.BaseEntity;

import java.util.List;

/**
 * 客户列表查询参数
 */
public class CustomerQueryDTO extends BaseEntity {
    private static final long serialVersionUID = 1L;

    /**
     * 客户名称
     */
    private String customerName;

    /**
     * 信用等级
     */
    private String creditLevel;

    /**
     * 客户分类
     */
    private String category;

    /**
     * 业务联系人
     */
    private String contactPerson;
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

    public String getCustomerName() {
        return customerName;
    }

    public void setCustomerName(String customerName) {
        this.customerName = customerName;
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

    public String getContactPerson() {
        return contactPerson;
    }

    public void setContactPerson(String contactPerson) {
        this.contactPerson = contactPerson;
    }

    public List<String> getRegion() {
        return region;
    }

    public void setRegion(List<String> region) {
        this.region = region;
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
}
