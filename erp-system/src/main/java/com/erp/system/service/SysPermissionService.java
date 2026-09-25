package com.erp.system.service;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.util.CollectionUtils;
import com.erp.common.constant.Constants;
import com.erp.common.constant.UserConstants;
import com.erp.common.core.domain.entity.SysRole;
import com.erp.common.core.domain.entity.SysUser;
import com.erp.common.utils.StringUtils;

/**
 * User permission handler
 *
 * @author finance
 */
@Component
public class SysPermissionService {
    @Autowired
    private ISysRoleService roleService;

    @Autowired
    private ISysMenuService menuService;

    public Set<String> getRolePermission(SysUser user) {
        Set<String> roles = new HashSet<String>();
        if (user.isAdmin()) {
            roles.add(Constants.SUPER_ADMIN);
        } else {
            roles.addAll(roleService.selectRolePermissionByUserId(user.getUserId()));
        }
        return roles;
    }

    public Set<String> getMenuPermission(SysUser user) {
        Set<String> perms = new HashSet<String>();
        if (user.isAdmin()) {
            perms.add(Constants.ALL_PERMISSION);
        } else {
            List<SysRole> roles = user.getRoles();
            if (!CollectionUtils.isEmpty(roles)) {
                for (SysRole role : roles) {
                    if (StringUtils.equals(role.getStatus(), UserConstants.ROLE_NORMAL) && !role.isAdmin()) {
                        Set<String> rolePerms = menuService.selectMenuPermsByRoleId(role.getRoleId());
                        role.setPermissions(rolePerms);
                        perms.addAll(rolePerms);
                    }
                }
            } else {
                perms.addAll(menuService.selectMenuPermsByUserId(user.getUserId()));
            }
        }
        return perms;
    }
}
