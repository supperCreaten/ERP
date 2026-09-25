package com.erp.framework.security.handle;

import java.io.IOException;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.logout.LogoutSuccessHandler;
import com.alibaba.fastjson2.JSON;
import com.erp.common.constant.Constants;
import com.erp.common.core.domain.AjaxResult;
import com.erp.common.core.domain.model.LoginUser;
import com.erp.common.utils.MessageUtils;
import com.erp.common.utils.ServletUtils;
import com.erp.common.utils.StringUtils;
import com.erp.framework.manager.AsyncManager;
import com.erp.framework.manager.factory.AsyncFactory;
import com.erp.framework.web.service.TokenService;

/**
 * 自定义退出处理类 返回成功
 * 
 * @author finance
 */
@Configuration
public class LogoutSuccessHandlerImpl implements LogoutSuccessHandler
{
    @Autowired
    private TokenService tokenService;

    /**
     * 退出处理
     * 
     * @return
     */
    @Override
    public void onLogoutSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication)
            throws IOException, ServletException
    {
        LoginUser loginUser = tokenService.getLoginUser(request);
        String refreshToken = null;
        if (request.getCookies() != null)
        {
            for (jakarta.servlet.http.Cookie cookie : request.getCookies())
            {
                if ("refreshToken".equals(cookie.getName()))
                {
                    refreshToken = cookie.getValue();
                    break;
                }
            }
        }
        if (StringUtils.isNotNull(loginUser))
        {
            String userName = loginUser.getUsername();
            tokenService.delLoginUser(loginUser.getToken());
            tokenService.clearRefreshToken(userName, refreshToken, response);
            AsyncManager.me().execute(AsyncFactory.recordLogininfor(userName, Constants.LOGOUT, MessageUtils.message("user.logout.success")));
        }
        else if (StringUtils.isNotEmpty(refreshToken))
        {
            tokenService.clearRefreshToken(null, refreshToken, response);
        }
        ServletUtils.renderString(response, JSON.toJSONString(AjaxResult.success("logout success")));
    }
}
