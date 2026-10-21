package com.erp.system.domain.dto;

import com.erp.common.core.domain.BaseEntity;

/**
 * 销售订单明细入参
 */
public class SalesOrderItemDTO extends BaseEntity {
    private static final long serialVersionUID = 1L;

    /**
     * 明细ID（修改时使用；新增时由数据库回填）
     */
    private Long itemId;

    /**
     * 订单ID
     */
    private Long orderId;

    /**
     * 序号
     */
    private String lineNo;

    /**
     * 物料编码
     */
    private String materialCode;

    /**
     * 物料名称
     */
    private String materialName;

    /**
     * 型号规格
     */
    private String spec;

    /**
     * 主计量
     */
    private String unit;

    /**
     * 数量
     */
    private String quantity;

    /**
     * 单价
     */
    private String unitPrice;

    /**
     * 金额
     */
    private String amount;

    /**
     * 行税率(%)
     */
    private String taxRate;

    /**
     * 行税额
     */
    private String taxAmount;

    /**
     * 行交货日期
     */
    private String deliveryDate;

    /**
     * 仓库
     */
    private String warehouse;

    /**
     * 交付件数
     */
    private String deliveryQty;

    /**
     * 已发数量
     */
    private String shippedQty;

    /**
     * 质量要求
     */
    private String qualityReq;

    /**
     * 包装要求
     */
    private String packageReq;

    public Long getItemId() { return itemId; }
    public void setItemId(Long itemId) { this.itemId = itemId; }
    public Long getOrderId() { return orderId; }
    public void setOrderId(Long orderId) { this.orderId = orderId; }
    public String getLineNo() { return lineNo; }
    public void setLineNo(String lineNo) { this.lineNo = lineNo; }
    public String getMaterialCode() { return materialCode; }
    public void setMaterialCode(String materialCode) { this.materialCode = materialCode; }
    public String getMaterialName() { return materialName; }
    public void setMaterialName(String materialName) { this.materialName = materialName; }
    public String getSpec() { return spec; }
    public void setSpec(String spec) { this.spec = spec; }
    public String getUnit() { return unit; }
    public void setUnit(String unit) { this.unit = unit; }
    public String getQuantity() { return quantity; }
    public void setQuantity(String quantity) { this.quantity = quantity; }
    public String getUnitPrice() { return unitPrice; }
    public void setUnitPrice(String unitPrice) { this.unitPrice = unitPrice; }
    public String getAmount() { return amount; }
    public void setAmount(String amount) { this.amount = amount; }
    public String getTaxRate() { return taxRate; }
    public void setTaxRate(String taxRate) { this.taxRate = taxRate; }
    public String getTaxAmount() { return taxAmount; }
    public void setTaxAmount(String taxAmount) { this.taxAmount = taxAmount; }
    public String getDeliveryDate() { return deliveryDate; }
    public void setDeliveryDate(String deliveryDate) { this.deliveryDate = deliveryDate; }
    public String getWarehouse() { return warehouse; }
    public void setWarehouse(String warehouse) { this.warehouse = warehouse; }
    public String getDeliveryQty() { return deliveryQty; }
    public void setDeliveryQty(String deliveryQty) { this.deliveryQty = deliveryQty; }
    public String getShippedQty() { return shippedQty; }
    public void setShippedQty(String shippedQty) { this.shippedQty = shippedQty; }
    public String getQualityReq() { return qualityReq; }
    public void setQualityReq(String qualityReq) { this.qualityReq = qualityReq; }
    public String getPackageReq() { return packageReq; }
    public void setPackageReq(String packageReq) { this.packageReq = packageReq; }
}
