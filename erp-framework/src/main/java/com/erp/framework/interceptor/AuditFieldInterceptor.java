package com.erp.framework.interceptor;

import java.util.Properties;
import org.apache.ibatis.executor.Executor;
import org.apache.ibatis.mapping.MappedStatement;
import org.apache.ibatis.mapping.SqlCommandType;
import org.apache.ibatis.plugin.Interceptor;
import org.apache.ibatis.plugin.Intercepts;
import org.apache.ibatis.plugin.Invocation;
import org.apache.ibatis.plugin.Plugin;
import org.apache.ibatis.plugin.Signature;
import com.erp.common.utils.EntityAuditUtils;

/**
 * MyBatis 审计字段自动填充拦截器
 * <p>在 insert / update 执行前自动写入 createBy、createTime、updateBy、updateTime</p>
 *
 * @author finance
 */
@Intercepts({
    @Signature(type = Executor.class, method = "update", args = { MappedStatement.class, Object.class })
})
public class AuditFieldInterceptor implements Interceptor
{
    @Override
    public Object intercept(Invocation invocation) throws Throwable
    {
        MappedStatement mappedStatement = (MappedStatement) invocation.getArgs()[0];
        Object parameter = invocation.getArgs()[1];
        SqlCommandType sqlCommandType = mappedStatement.getSqlCommandType();
        if (SqlCommandType.INSERT == sqlCommandType)
        {
            EntityAuditUtils.fillInsert(parameter);
        }
        else if (SqlCommandType.UPDATE == sqlCommandType)
        {
            EntityAuditUtils.fillUpdate(parameter);
        }
        return invocation.proceed();
    }

    @Override
    public Object plugin(Object target)
    {
        return Plugin.wrap(target, this);
    }

    @Override
    public void setProperties(Properties properties)
    {
        // no-op
    }
}
