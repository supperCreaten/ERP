package com.erp.common.utils;

import java.util.Collection;
import java.util.Date;
import java.util.Map;
import com.erp.common.core.domain.BaseEntity;

/**
 * 实体审计字段填充（创建人/更新人/创建时间/更新时间）
 *
 * @author finance
 */
public final class EntityAuditUtils
{
    private static final String DEFAULT_OPERATOR = "admin";

    private EntityAuditUtils()
    {
    }

    /**
     * 新增时填充审计字段
     */
    public static void fillInsert(Object parameter)
    {
        process(parameter, true);
    }

    /**
     * 更新时填充审计字段
     */
    public static void fillUpdate(Object parameter)
    {
        process(parameter, false);
    }

    private static void process(Object parameter, boolean insert)
    {
        if (parameter == null)
        {
            return;
        }
        if (parameter instanceof BaseEntity entity)
        {
            apply(entity, insert);
            return;
        }
        if (parameter instanceof Map<?, ?> map)
        {
            for (Object value : map.values())
            {
                process(value, insert);
            }
            return;
        }
        if (parameter instanceof Collection<?> collection)
        {
            for (Object item : collection)
            {
                process(item, insert);
            }
        }
    }

    private static void apply(BaseEntity entity, boolean insert)
    {
        String operator = resolveOperator();
        Date now = DateUtils.getNowDate();
        if (insert)
        {
            if (StringUtils.isEmpty(entity.getCreateBy()))
            {
                entity.setCreateBy(operator);
            }
            if (entity.getCreateTime() == null)
            {
                entity.setCreateTime(now);
            }
        }
        entity.setUpdateBy(operator);
        entity.setUpdateTime(now);
    }

    /**
     * 操作人取 sys_user.user_name（显示名），不使用登录账号
     */
    private static String resolveOperator()
    {
        try
        {
            String nickName = SecurityUtils.getNickName();
            return StringUtils.isNotEmpty(nickName) ? nickName : DEFAULT_OPERATOR;
        }
        catch (Exception e)
        {
            return DEFAULT_OPERATOR;
        }
    }
}
