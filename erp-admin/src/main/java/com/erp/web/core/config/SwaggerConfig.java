package com.erp.web.core.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import com.erp.common.config.ErpConfig;
import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;

/**
 * OpenAPI / Knife4j 文档配置
 *
 * @author erp
 */
@Configuration
public class SwaggerConfig
{
    @Autowired
    private ErpConfig erpConfig;

    @Bean
    public OpenAPI customOpenApi()
    {
        return new OpenAPI()
            .info(getApiInfo())
            .components(new Components().addSecuritySchemes("Authorization", securityScheme()))
            .addSecurityItem(new SecurityRequirement().addList("Authorization"));
    }

    private SecurityScheme securityScheme()
    {
        return new SecurityScheme()
            .type(SecurityScheme.Type.HTTP)
            .scheme("bearer")
            .bearerFormat("JWT")
            .in(SecurityScheme.In.HEADER)
            .name("Authorization")
            .description("登录后将 token 填入，格式：Bearer {token}");
    }

    private Info getApiInfo()
    {
        return new Info()
            .title("ERP 管理系统接口文档")
            .description("Knife4j 文档：访问 /doc.html。Authorize 中填写 Bearer Token 后调试接口。")
            .contact(new Contact().name(erpConfig.getName()))
            .version(erpConfig.getVersion());
    }
}
