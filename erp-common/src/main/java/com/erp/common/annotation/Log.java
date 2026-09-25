package com.erp.common.annotation;

import java.lang.annotation.Documented;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

import com.erp.common.enums.BusinessType;
import com.erp.common.enums.OperatorType;

/**
 * 自定义操作日志记录注解
 *
 * @author finance
 */
@Target({ElementType.PARAMETER, ElementType.METHOD})
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface Log {
    /**
     * 模块
     */
    public String title() default "";

    /**
     * 功能
     */
    public BusinessType businessType() default BusinessType.OTHER;

    /**
     * 操作人类别
     */
    public OperatorType operatorType() default OperatorType.MANAGE;

    /**
     * 是否保存请求的参数
     */
    public boolean isSaveRequestData() default true;

    /**
     * 是否保存响应的参数
     */
    public boolean isSaveResponseData() default true;

    /**
     * 排除指定的请求参数
     */
    public String[] excludeParamNames() default {};

    /**
     * 业务主键 SpEL，用于 UPDATE/DELETE/GRANT 查询旧值。
     * 示例：#user.userId、#menuId、#roleId
     */
    public String bizId() default "";

    /**
     * 字段对比时额外排除的字段名
     */
    public String[] excludeFields() default {};
}
