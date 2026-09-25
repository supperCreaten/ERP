package com.erp.system.domain.enums;

import java.util.Objects;

/**
 * 房屋状态
 * <p>0:未销售, 1:已交房, 2:装修中, 3:已装修, 4:未入住, 5:已入住</p>
 */
public enum HouseStatusEnum {
    UNSOLD("0", "未销售"),
    DELIVERED("1", "已交房"),
    REMODELING("2", "装修中"),
    RENOVATED("3", "已装修"),
    NOT_CHECKED_IN("4", "未入住"),
    CHECKED_IN("5", "已入住");

    private final String code;
    private final String info;

    HouseStatusEnum(String code, String info) {
        this.code = code;
        this.info = info;
    }

    public String getCode() {
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
    public static String getName(String code) {
        if (code == null || code.isBlank()) {
            return "未知状态";
        }
        String normalized = code.trim();
        for (HouseStatusEnum value : values()) {
            if (Objects.equals(value.code, normalized)) {
                return value.info;
            }
        }
        return "未知状态";
    }
}
