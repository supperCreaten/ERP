package com.erp.common.core.service;

import com.erp.common.core.domain.model.LoginUser;
import jakarta.servlet.http.HttpServletResponse;

/**
 * Token service abstraction. Implemented in framework.
 *
 * @author finance
 */
public interface ITokenService
{
    void setLoginUser(LoginUser loginUser);

    void refreshToken(LoginUser loginUser);

    /**
     * 登录成功后写入 refreshToken Cookie（JWT，生成规则与 accessToken 相同），并缓存映射
     */
    String createRefreshToken(LoginUser loginUser, HttpServletResponse response);

    /**
     * 使用 refreshToken Cookie（JWT）换取新的 accessToken
     */
    String refreshAccessToken(String refreshToken);

    /**
     * 清除 refreshToken 缓存与 Cookie
     */
    void clearRefreshToken(String account, String refreshToken, HttpServletResponse response);
}
