package com.erp.framework.config;

import org.springframework.boot.jackson.autoconfigure.JsonMapperBuilderCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import tools.jackson.databind.module.SimpleModule;
import tools.jackson.databind.ser.std.ToStringSerializer;

/**
 * Jackson 3（Spring Boot 4）全局配置：Long / long 序列化为字符串，
 * 避免前端 JS 大整数精度丢失。仅影响响应；请求仍可绑定数字或数字字符串。
 */
@Configuration
public class JacksonConfig
{
    @Bean
    public JsonMapperBuilderCustomizer longAsStringCustomizer()
    {
        return builder -> {
            SimpleModule module = new SimpleModule("LongAsString");
            module.addSerializer(Long.class, ToStringSerializer.instance);
            module.addSerializer(Long.TYPE, ToStringSerializer.instance);
            builder.addModule(module);
        };
    }
}
