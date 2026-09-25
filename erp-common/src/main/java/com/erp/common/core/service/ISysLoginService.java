package com.erp.common.core.service;

import jakarta.servlet.http.HttpServletResponse;

/**
 * Login service abstraction. Implemented in framework.
 *
 * @author finance
 */
public interface ISysLoginService
{
    String login(String username, String password);

    /**
     * 登录并写入 refreshToken Cookie（对齐 server）
     */
    String login(String username, String password, HttpServletResponse response);
}
