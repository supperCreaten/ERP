package com.erp.system.domain.vo;

import com.erp.common.core.domain.BaseEntity;
import com.fasterxml.jackson.annotation.JsonFormat;

import java.util.Date;
import java.util.List;

/**
 * 销售订单详情/列表出参
 */
public class SalesOrderVO extends BaseEntity {
    private static final long serialVersionUID = 1L;

    /**
     * 订单ID
     */
    private Long orderId;

    /**
     * 订单号
     */
    private String orderNo;

    /**
     * 单据日期
     */
    private String billDate;

    /**
     * 单据状态（draft草稿 audited已审核 closed已关闭 cancelled作废）
     */
    private String billStatus;

    /**
     * 客户ID
     */
    private Long customerId;

    /**
     * 客户名称
     */
    private String customerName;

    /**
     * 联系人
     */
    private String contactPerson;

    /**
     * 联系电话
     */
    private String contactPhone;

    /**
     * 收货人
     */
    private String consignee;

    /**
     * 收货地址
     */
    private String deliveryAddress;

    /**
     * 销售部门
     */
    private String salesDept;

    /**
     * 销售人员
     */
    private String salesPerson;

    /**
     * 业务类型
     */
    private String businessType;

    /**
     * 销售类型
     */
    private String salesType;

    /**
     * 销售类型(中文)
     */
    private String salesTypeText;

    /**
     * 结算方式
     */
    private String settlementMethod;

    /**
     * 付款条件
     */
    private String paymentTerms;

    /**
     * 交货方式
     */
    private String deliveryMethod;

    /**
     * 运输方式
     */
    private String transportMethod;

    /**
     * 发货仓库
     */
    private String warehouse;

    /**
     * 交货日期
     */
    private String deliveryDate;

    /**
     * 预计发货日期
     */
    private String plannedShipDate;

    /**
     * 合同号
     */
    private String contractNo;

    /**
     * 客户订单号
     */
    private String customerOrderNo;

    /**
     * 币种
     */
    private String currency;

    /**
     * 汇率
     */
    private String exchangeRate;

    /**
     * 税率
     */
    private String taxRate;

    /**
     * 含税标志（0未税 1含税）
     */
    private String taxIncluded;

    /**
     * 折扣率(%)
     */
    private String discountRate;

    /**
     * 优惠金额
     */
    private String discountAmount;

    /**
     * 数量合计
     */
    private String totalQty;

    /**
     * 金额合计
     */
    private String totalAmount;

    /**
     * 税额合计
     */
    private String taxAmount;

    /**
     * 发票类型
     */
    private String invoiceType;

    /**
     * 开票抬头
     */
    private String invoiceTitle;

    /**
     * 开票地址
     */
    private String invoiceAddress;

    /**
     * 制单人
     */
    private String operator;

    /**
     * 审核人
     */
    private String auditor;

    /**
     * 审核日期
     */
    private String auditDate;

    /**
     * 删除标志（0正常 1删除）
     */
    private String isDel;

    /**
     * 订单明细
     */
    private List<SalesOrderItemVO> items;

    @Override
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    public Date getCreateTime() { return super.getCreateTime(); }

    @Override
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    public Date getUpdateTime() { return super.getUpdateTime(); }

    public Long getOrderId() { return orderId; }
    public void setOrderId(Long orderId) { this.orderId = orderId; }
    public String getOrderNo() { return orderNo; }
    public void setOrderNo(String orderNo) { this.orderNo = orderNo; }
    public String getBillDate() { return billDate; }
    public void setBillDate(String billDate) { this.billDate = billDate; }
    public String getBillStatus() { return billStatus; }
    public void setBillStatus(String billStatus) { this.billStatus = billStatus; }
    public Long getCustomerId() { return customerId; }
    public void setCustomerId(Long customerId) { this.customerId = customerId; }
    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }
    public String getContactPerson() { return contactPerson; }
    public void setContactPerson(String contactPerson) { this.contactPerson = contactPerson; }
    public String getContactPhone() { return contactPhone; }
    public void setContactPhone(String contactPhone) { this.contactPhone = contactPhone; }
    public String getConsignee() { return consignee; }
    public void setConsignee(String consignee) { this.consignee = consignee; }
    public String getDeliveryAddress() { return deliveryAddress; }
    public void setDeliveryAddress(String deliveryAddress) { this.deliveryAddress = deliveryAddress; }
    public String getSalesDept() { return salesDept; }
    public void setSalesDept(String salesDept) { this.salesDept = salesDept; }
    public String getSalesPerson() { return salesPerson; }
    public void setSalesPerson(String salesPerson) { this.salesPerson = salesPerson; }
    public String getBusinessType() { return businessType; }
    public void setBusinessType(String businessType) { this.businessType = businessType; }
    public String getSalesType() { return salesType; }
    public void setSalesType(String salesType) { this.salesType = salesType; }
    public String getSalesTypeText() { return salesTypeText; }
    public void setSalesTypeText(String salesTypeText) { this.salesTypeText = salesTypeText; }
    public String getSettlementMethod() { return settlementMethod; }
    public void setSettlementMethod(String settlementMethod) { this.settlementMethod = settlementMethod; }
    public String getPaymentTerms() { return paymentTerms; }
    public void setPaymentTerms(String paymentTerms) { this.paymentTerms = paymentTerms; }
    public String getDeliveryMethod() { return deliveryMethod; }
    public void setDeliveryMethod(String deliveryMethod) { this.deliveryMethod = deliveryMethod; }
    public String getTransportMethod() { return transportMethod; }
    public void setTransportMethod(String transportMethod) { this.transportMethod = transportMethod; }
    public String getWarehouse() { return warehouse; }
    public void setWarehouse(String warehouse) { this.warehouse = warehouse; }
    public String getDeliveryDate() { return deliveryDate; }
    public void setDeliveryDate(String deliveryDate) { this.deliveryDate = deliveryDate; }
    public String getPlannedShipDate() { return plannedShipDate; }
    public void setPlannedShipDate(String plannedShipDate) { this.plannedShipDate = plannedShipDate; }
    public String getContractNo() { return contractNo; }
    public void setContractNo(String contractNo) { this.contractNo = contractNo; }
    public String getCustomerOrderNo() { return customerOrderNo; }
    public void setCustomerOrderNo(String customerOrderNo) { this.customerOrderNo = customerOrderNo; }
    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }
    public String getExchangeRate() { return exchangeRate; }
    public void setExchangeRate(String exchangeRate) { this.exchangeRate = exchangeRate; }
    public String getTaxRate() { return taxRate; }
    public void setTaxRate(String taxRate) { this.taxRate = taxRate; }
    public String getTaxIncluded() { return taxIncluded; }
    public void setTaxIncluded(String taxIncluded) { this.taxIncluded = taxIncluded; }
    public String getDiscountRate() { return discountRate; }
    public void setDiscountRate(String discountRate) { this.discountRate = discountRate; }
    public String getDiscountAmount() { return discountAmount; }
    public void setDiscountAmount(String discountAmount) { this.discountAmount = discountAmount; }
    public String getTotalQty() { return totalQty; }
    public void setTotalQty(String totalQty) { this.totalQty = totalQty; }
    public String getTotalAmount() { return totalAmount; }
    public void setTotalAmount(String totalAmount) { this.totalAmount = totalAmount; }
    public String getTaxAmount() { return taxAmount; }
    public void setTaxAmount(String taxAmount) { this.taxAmount = taxAmount; }
    public String getInvoiceType() { return invoiceType; }
    public void setInvoiceType(String invoiceType) { this.invoiceType = invoiceType; }
    public String getInvoiceTitle() { return invoiceTitle; }
    public void setInvoiceTitle(String invoiceTitle) { this.invoiceTitle = invoiceTitle; }
    public String getInvoiceAddress() { return invoiceAddress; }
    public void setInvoiceAddress(String invoiceAddress) { this.invoiceAddress = invoiceAddress; }
    public String getOperator() { return operator; }
    public void setOperator(String operator) { this.operator = operator; }
    public String getAuditor() { return auditor; }
    public void setAuditor(String auditor) { this.auditor = auditor; }
    public String getAuditDate() { return auditDate; }
    public void setAuditDate(String auditDate) { this.auditDate = auditDate; }
    public String getIsDel() { return isDel; }
    public void setIsDel(String isDel) { this.isDel = isDel; }
    public List<SalesOrderItemVO> getItems() { return items; }
    public void setItems(List<SalesOrderItemVO> items) { this.items = items; }
}
