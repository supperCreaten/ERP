package com.erp.system.domain.dto;

import com.erp.common.core.domain.BaseEntity;

/**
 * 字典项保存参数
 */
public class SysDictDataSaveReq extends BaseEntity {
    private static final long serialVersionUID = 1L;

    /**
     * 字典项ID
     */
    private Long id;
    /**
     * 所属字典主表ID
     */
    private Long dictId;
    /**
     * 字典标签
     */
    private String dictLabel;
    /**
     * 字典键值
     */
    private String dictValue;
    /**
     * 字典项状态
     */
    private String status;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getDictId() {
        return dictId;
    }

    public void setDictId(Long dictId) {
        this.dictId = dictId;
    }

    public String getDictLabel() {
        return dictLabel;
    }

    public void setDictLabel(String dictLabel) {
        this.dictLabel = dictLabel;
    }

    public String getDictValue() {
        return dictValue;
    }

    public void setDictValue(String dictValue) {
        this.dictValue = dictValue;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
