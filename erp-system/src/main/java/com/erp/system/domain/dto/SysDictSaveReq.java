package com.erp.system.domain.dto;

import com.erp.common.core.domain.BaseEntity;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;

import java.util.List;

/**
 * 字典新增/修改参数
 */
public class SysDictSaveReq extends BaseEntity {
    private static final long serialVersionUID = 1L;

    /**
     * 字典ID（修改时必填）
     */
    private Long dictId;
    /**
     * 字典名称
     */
    @NotBlank(message = "字典名称不能为空")
    private String dictName;
    /**
     * 字典编码
     */
    @NotBlank(message = "字典编码不能为空")
    private String dictCode;
    /**
     * 字典状态
     */
    @NotBlank(message = "字典状态不能为空")
    private String status;
    /**
     * 字典项列表
     */
    @Valid
    private List<SysDictDataSaveReq> items;

    public Long getDictId() {
        return dictId;
    }

    public void setDictId(Long dictId) {
        this.dictId = dictId;
    }

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

    public List<SysDictDataSaveReq> getItems() {
        return items;
    }

    public void setItems(List<SysDictDataSaveReq> items) {
        this.items = items;
    }
}
