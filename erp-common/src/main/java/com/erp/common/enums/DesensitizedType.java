package com.erp.common.enums;

import java.util.function.Function;
import com.erp.common.utils.DesensitizedUtil;
import com.erp.common.utils.StringUtils;

/**
 * 脱敏类型
 *
 * @author finance
 */
public enum DesensitizedType
{
    /**
     * 姓名，第2位星号替换
     */
    USERNAME(s -> s.replaceAll("(\\S)\\S(\\S*)", "$1*$2")),

    /**
     * 密码，全部字符都用*代替
     */
    PASSWORD(DesensitizedUtil::password),

    /**
     * 身份证：保留前4后4，中间以 * 替换（兼容 15/18 位）
     */
    ID_CARD(s -> {
        if (s == null || s.length() < 8)
        {
            return s;
        }
        int len = s.length();
        return s.substring(0, 4) + StringUtils.repeat('*', len - 8) + s.substring(len - 4);
    }),

    /**
     * 手机号：保留前3后4，中间4位 *
     */
    PHONE(s -> {
        if (s == null)
        {
            return null;
        }
        String digits = s.replaceAll("\\D", "");
        if (digits.length() < 7)
        {
            return s;
        }
        if (digits.length() == 11)
        {
            return digits.substring(0, 3) + "****" + digits.substring(7);
        }
        return digits.substring(0, 3) + StringUtils.repeat('*', digits.length() - 7) + digits.substring(digits.length() - 4);
    }),

    /**
     * 电子邮箱，仅显示第一个字母和@后面的地址显示，其他星号替换
     */
    EMAIL(s -> s.replaceAll("(^.)[^@]*(@.*$)", "$1****$2")),

    /**
     * 银行卡号，保留最后4位，其他星号替换
     */
    BANK_CARD(s -> s.replaceAll("\\d{15}(\\d{3})", "**** **** **** **** $1")),

    /**
     * 车牌号码，包含普通车辆、新能源车辆
     */
    CAR_LICENSE(DesensitizedUtil::carLicense);

    private final Function<String, String> desensitizer;

    DesensitizedType(Function<String, String> desensitizer)
    {
        this.desensitizer = desensitizer;
    }

    public Function<String, String> desensitizer()
    {
        return desensitizer;
    }
}
