package com.erp.system.domain.dto;

import com.erp.common.core.domain.BaseEntity;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.List;

/**
 * 销售订单新增/修改入参
 */
public class SalesOrderAddDTO extends BaseEntity {
    private static final long serialVersionUID = 1L;

    /**
     * 订单ID（修改时使用；新增时由数据库回填）
     */
    private Long orderId;

    /**
     * 订单号
     */
    private String orderNo;

    /**
     * 单据日期
     */
    @NotBlank(message = "单据日期不能为空")
    private String billDate;

    /**
     * 单据状态（draft草稿 audited已审核 closed已关闭 cancelled作废）
     */
    private String billStatus;

    /**
     * 客户ID
     */
    @NotNull(message = "客户不能为空")
    private Long customerId;

    /**
     * 客户名称
     */
    private String customerName;

    /**
     * 联系人
     */
    @NotBlank(message = "联系人不能为空")
    private String contactPerson;

    /**
     * 联系电话
     */
    @NotBlank(message = "联系电话不能为空")
    private String contactPhone;

    /**
     * 收货人
     */
    @NotBlank(message = "收货人不能为空")
    private String consignee;

    /**
     * 收货地址
     */
    @NotBlank(message = "收货地址不能为空")
    private String deliveryAddress;

    /**
     * 销售部门（可选，可由销售人员所属部门带出）
     */
    private String salesDept;

    /**
     * 销售人员
     */
    @NotBlank(message = "销售人员不能为空")
    private String salesPerson;

    /**
     * 业务类型（可选，默认普通销售）
     */
    private String businessType;

    /**
     * 销售类型
     */
    @NotBlank(message = "销售类型不能为空")
    private String salesType;

    /**
     * 结算方式（可选）
     */
    private String settlementMethod;

    /**
     * 付款条件（可选）
     */
    private String paymentTerms;

    /**
     * 交货方式（可选）
     */
    private String deliveryMethod;

    /**
     * 运输方式（可选）
     */
    private String transportMethod;

    /**
     * 发货仓库（可选，发货时再填）
     */
    private String warehouse;

    /**
     * 交货日期
     */
    @NotBlank(message = "交货日期不能为空")
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
    @NotBlank(message = "币种不能为空")
    private String currency;

    /**
     * 汇率（可选，默认 1）
     */
    private String exchangeRate;

    /**
     * 税率（可选；明细行各自维护税率）
     */
    private String taxRate;

    /**
     * 含税标志（0未税 1含税）
     */
    @NotBlank(message = "含税标志不能为空")
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
     * 发票类型（可选，开票时再填）
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
     * 订单明细
     */
    @Valid
    @NotBlank(message = "订单明细不能为空")
    private List<SalesOrderItemDTO> items;

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
    public List<SalesOrderItemDTO> getItems() { return items; }
    public void setItems(List<SalesOrderItemDTO> items) { this.items = items; }
}
