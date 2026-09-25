package com.erp.system.controller;

import java.util.stream.Collectors;

import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.Operation;
import com.erp.common.core.domain.AjaxResult;
import com.erp.common.core.domain.entity.SysRole;
import com.erp.common.core.domain.entity.SysUser;
import com.erp.common.core.domain.model.LoginBody;
import com.erp.common.utils.SecurityUtils;
import com.erp.common.utils.StringUtils;
import com.erp.common.utils.sign.AesUtils;
import com.erp.common.core.service.ISysLoginService;
import com.erp.system.service.ISysUserService;

/**
 * 登录认证（对齐 server /login、/refreshToken、/userInfo、/authRoutes）
 *
 * @author finance
 */
@RestController
@Tag(name = "登录认证")
public class SysLoginController {
    @Autowired
    private ISysLoginService loginService;

    @Autowired
    private ISysUserService userService;

    @Operation(summary = "用户登录")
    @PostMapping("/login")
    public AjaxResult login(@RequestBody LoginBody loginBody, HttpServletResponse response) {
        String account = AesUtils.decrypt(loginBody.getAccount());
        String password = AesUtils.decrypt(loginBody.getPassword());
        if (StringUtils.isEmpty(account)) {
            return AjaxResult.error("账号不能为空");
        }
        String token = loginService.login(account, password, response);
        // token 是 String，必须走 success(msg, data)，否则会命中 success(String msg) 把 JWT 写进 msg
        return AjaxResult.success("操作成功", token);
    }


    /**
     * 当前登录用户信息（与 /authRoutes 同级，对外 /api/userInfo）
     */
    @Operation(summary = "当前登录用户信息")
    @GetMapping("/userInfo")
    public AjaxResult userInfo() {
        SysUser user = userService.selectUserById(SecurityUtils.getUserId());
        if (user == null) {
            return AjaxResult.error("用户不存在");
        }
        // 扁平化角色：取首个 roleId，roleName 逗号拼接
        if (user.getRoles() != null && !user.getRoles().isEmpty()) {
            user.setRoleId(user.getRoles().get(0).getRoleId());
            user.setRoleName(user.getRoles().stream()
                    .map(SysRole::getRoleName)
                    .filter(StringUtils::isNotEmpty)
                    .collect(Collectors.joining(",")));
        }
        user.setRoles(null);
        return AjaxResult.success(user);
    }

}
