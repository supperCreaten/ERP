package com.erp.framework.web.service;

import jakarta.annotation.Resource;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;
import com.erp.common.config.ErpConfig;
import com.erp.common.constant.Constants;
import com.erp.common.constant.UserConstants;
import com.erp.common.core.service.ISysLoginService;
import com.erp.common.core.domain.model.LoginUser;
import com.erp.common.exception.ServiceException;
import com.erp.common.exception.user.BlackListException;
import com.erp.common.exception.user.UserNotExistsException;
import com.erp.common.exception.user.UserPasswordNotMatchException;
import com.erp.common.utils.DateUtils;
import com.erp.common.utils.MessageUtils;
import com.erp.common.utils.StringUtils;
import com.erp.common.utils.ip.IpUtils;
import com.erp.framework.manager.AsyncManager;
import com.erp.framework.manager.factory.AsyncFactory;
import com.erp.framework.security.context.AuthenticationContextHolder;
import com.erp.system.service.ISysUserService;

/**
 * 登录校验方法
 *
 * @author finance
 */
@Component
public class SysLoginService implements ISysLoginService {
    @Autowired
    private TokenService tokenService;

    @Resource
    private AuthenticationManager authenticationManager;

    @Autowired
    private ISysUserService userService;

    @Override
    public String login(String username, String password) {
        return doLogin(username, password, null);
    }

    @Override
    public String login(String username, String password, HttpServletResponse response) {
        return doLogin(username, password, response);
    }

    private String doLogin(String username, String password, HttpServletResponse response) {
        loginPreCheck(username, password);
        Authentication authentication;
        try {
            UsernamePasswordAuthenticationToken authenticationToken = new UsernamePasswordAuthenticationToken(username, password);
            AuthenticationContextHolder.setContext(authenticationToken);
            authentication = authenticationManager.authenticate(authenticationToken);
        } catch (Exception e) {
            if (e instanceof BadCredentialsException) {
                AsyncManager.me().execute(AsyncFactory.recordLogininfor(username, Constants.LOGIN_FAIL, MessageUtils.message("user.password.not.match")));
                throw new UserPasswordNotMatchException();
            }
            AsyncManager.me().execute(AsyncFactory.recordLogininfor(username, Constants.LOGIN_FAIL, e.getMessage()));
            throw new ServiceException(e.getMessage());
        } finally {
            AuthenticationContextHolder.clearContext();
        }
        AsyncManager.me().execute(AsyncFactory.recordLogininfor(username, Constants.LOGIN_SUCCESS, MessageUtils.message("user.login.success")));
        LoginUser loginUser = (LoginUser) authentication.getPrincipal();
        if (loginUser != null) {
            recordLoginInfo(loginUser.getUserId());
        }
        String accessToken = null;
        if (loginUser != null) {
            accessToken = tokenService.createToken(loginUser);
        }
        if (response != null) {
            if (loginUser != null) {
                tokenService.createRefreshToken(loginUser, response);
            }
        }
        return accessToken;
    }

    public void loginPreCheck(String username, String password) {
        if (StringUtils.isEmpty(username) || StringUtils.isEmpty(password)) {
            AsyncManager.me().execute(AsyncFactory.recordLogininfor(username, Constants.LOGIN_FAIL, MessageUtils.message("not.null")));
            throw new UserNotExistsException();
        }
        if (password.length() < UserConstants.PASSWORD_MIN_LENGTH
                || password.length() > UserConstants.PASSWORD_MAX_LENGTH) {
            AsyncManager.me().execute(AsyncFactory.recordLogininfor(username, Constants.LOGIN_FAIL, MessageUtils.message("user.password.not.match")));
            throw new UserPasswordNotMatchException();
        }
        if (username.length() < UserConstants.USERNAME_MIN_LENGTH
                || username.length() > UserConstants.USERNAME_MAX_LENGTH) {
            AsyncManager.me().execute(AsyncFactory.recordLogininfor(username, Constants.LOGIN_FAIL, MessageUtils.message("user.password.not.match")));
            throw new UserPasswordNotMatchException();
        }
        String blackStr = ErpConfig.getBlackIPList();
        if (IpUtils.isMatchedIp(blackStr, IpUtils.getIpAddr())) {
            AsyncManager.me().execute(AsyncFactory.recordLogininfor(username, Constants.LOGIN_FAIL, MessageUtils.message("login.blocked")));
            throw new BlackListException();
        }
    }

    public void recordLoginInfo(Long userId) {
        userService.updateLoginInfo(userId, IpUtils.getIpAddr(), DateUtils.getNowDate());
    }
}
