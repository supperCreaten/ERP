package com.erp.system.domain.enums;

import java.util.Objects;

/**
 * 小区入驻状态
 * <p>0:未入住, 1:入住中, 2:已入住</p>
 */
public enum ComplexStatusEnum {
    DRAFT(0, "未入住"),
    APPROVING(1, "入住中"),
    APPROVED(2, "已入住");

    private final Integer code;
    private final String info;

    ComplexStatusEnum(Integer code, String info) {
        this.code = code;
        this.info = info;
    }

    public Integer getCode() {
        return code;
    }

    public String getInfo() {
        return info;
    }

    /**
     * 根据状态码获取中文名称
     *
     * @param code 状态码
     * @return 状态中文；未匹配时返回「未知状态」
     */
    public static String getName(Integer code) {
        if (code == null) {
            return "未知状态";
        }
        for (ComplexStatusEnum value : values()) {
            if (Objects.equals(value.code, code)) {
                return value.info;
            }
        }
        return "未知状态";
    }
}
