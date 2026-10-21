package com.erp.system.domain.dto;

import com.erp.common.core.domain.BaseEntity;

/**
 * 销售订单列表查询参数
 */
public class SalesOrderQueryDTO extends BaseEntity {
    private static final long serialVersionUID = 1L;

    /** 订单号 */
    private String orderNo;

    /** 客户名称 */
    private String customerName;

    /** 客户ID */
    private Long customerId;

    /** 单据状态 */
    private String billStatus;

    /** 业务类型 */
    private String businessType;

    /** 销售类型 */
    private String salesType;

    /** 结算方式 */
    private String settlementMethod;

    /** 销售人员 */
    private String salesPerson;

    /** 合同号 */
    private String contractNo;

    /** 单据日期起 */
    private String billDateBegin;

    /** 单据日期止 */
    private String billDateEnd;

    public String getOrderNo() {
        return orderNo;
    }

    public void setOrderNo(String orderNo) {
        this.orderNo = orderNo;
    }

    public String getCustomerName() {
        return customerName;
    }

    public void setCustomerName(String customerName) {
        this.customerName = customerName;
    }

    public Long getCustomerId() {
        return customerId;
    }

    public void setCustomerId(Long customerId) {
        this.customerId = customerId;
    }

    public String getBillStatus() {
        return billStatus;
    }

    public void setBillStatus(String billStatus) {
        this.billStatus = billStatus;
    }

    public String getBusinessType() {
        return businessType;
    }

    public void setBusinessType(String businessType) {
        this.businessType = businessType;
    }

    public String getSalesType() {
        return salesType;
    }

    public void setSalesType(String salesType) {
        this.salesType = salesType;
    }

    public String getSettlementMethod() {
        return settlementMethod;
    }

    public void setSettlementMethod(String settlementMethod) {
        this.settlementMethod = settlementMethod;
    }

    public String getSalesPerson() {
        return salesPerson;
    }

    public void setSalesPerson(String salesPerson) {
        this.salesPerson = salesPerson;
    }

    public String getContractNo() {
        return contractNo;
    }

    public void setContractNo(String contractNo) {
        this.contractNo = contractNo;
    }

    public String getBillDateBegin() {
        return billDateBegin;
    }

    public void setBillDateBegin(String billDateBegin) {
        this.billDateBegin = billDateBegin;
    }

    public String getBillDateEnd() {
        return billDateEnd;
    }

    public void setBillDateEnd(String billDateEnd) {
        this.billDateEnd = billDateEnd;
    }
}
