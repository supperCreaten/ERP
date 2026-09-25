package com.erp.common.utils;

import com.erp.common.enums.DesensitizedType;

/**
 * 脱敏工具类
 *
 * @author finance
 */
public class DesensitizedUtil
{
    /**
     * 密码的全部字符都用*代替，比如：******
     *
     * @param password 密码
     * @return 脱敏后的密码
     */
    public static String password(String password)
    {
        if (StringUtils.isBlank(password))
        {
            return StringUtils.EMPTY;
        }
        return StringUtils.repeat('*', password.length());
    }

    /**
     * 手机号脱敏，中间4位星号替换，如 138****8000
     */
    public static String phone(String phone)
    {
        if (StringUtils.isBlank(phone))
        {
            return StringUtils.EMPTY;
        }
        return DesensitizedType.PHONE.desensitizer().apply(phone);
    }

    /**
     * 身份证脱敏，中间10位星号替换
     */
    public static String idCard(String idCard)
    {
        if (StringUtils.isBlank(idCard))
        {
            return StringUtils.EMPTY;
        }
        return DesensitizedType.ID_CARD.desensitizer().apply(idCard);
    }

    /**
     * 按类型脱敏
     */
    public static String desensitize(String value, DesensitizedType type)
    {
        if (StringUtils.isBlank(value) || type == null)
        {
            return value == null ? null : StringUtils.EMPTY;
        }
        return type.desensitizer().apply(value);
    }

    /**
     * 车牌中间用*代替，如果是错误的车牌，不处理
     *
     * @param carLicense 完整的车牌号
     * @return 脱敏后的车牌
     */
    public static String carLicense(String carLicense)
    {
        if (StringUtils.isBlank(carLicense))
        {
            return StringUtils.EMPTY;
        }
        // 普通车牌
        if (carLicense.length() == 7)
        {
            carLicense = StringUtils.hide(carLicense, 3, 6);
        }
        else if (carLicense.length() == 8)
        {
            // 新能源车牌
            carLicense = StringUtils.hide(carLicense, 3, 7);
        }
        return carLicense;
    }
}
