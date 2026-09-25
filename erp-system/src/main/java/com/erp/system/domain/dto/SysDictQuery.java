package com.erp.system.domain.dto;

import com.erp.common.core.domain.BaseEntity;

/**
 * 字典列表查询参数
 */
public class SysDictQuery extends BaseEntity {
    private static final long serialVersionUID = 1L;

    /**
     * 字典名称
     */
    private String dictName;
    /**
     * 字典编码
     */
    private String dictCode;
    /**
     * 字典状态
     */
    private String status;

    public String getDictName() {
        return dictName;
    }

    public void setDictName(String dictName) {
        this.dictName = dictName;
    }

    public String getDictCode() {
        return dictCode;
    }

    public void setDictCode(String dictCode) {
        this.dictCode = dictCode;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
