package com.erp.system.controller;

import java.util.List;
import java.util.Map;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.Operation;
import com.erp.common.annotation.Log;
import com.erp.common.core.controller.BaseController;
import com.erp.common.core.domain.AjaxResult;
import com.erp.common.core.domain.entity.SysRole;
import com.erp.common.core.domain.entity.SysUser;
import com.erp.common.core.domain.model.LoginUser;
import com.erp.common.enums.BusinessType;
import com.erp.common.utils.StringUtils;
import com.erp.common.core.service.ITokenService;
import com.erp.system.service.SysPermissionService;
import com.erp.system.service.ISysMenuService;
import com.erp.system.service.ISysRoleService;
import com.erp.system.service.ISysUserService;

/**
 * 角色管理（对齐 server /api/role，无重复接口）
 *
 * @author finance
 */
@RestController
@Tag(name = "角色管理")
@RequestMapping("/role")
public class SysRoleController extends BaseController
{
    @Autowired
    private ISysRoleService roleService;

    @Autowired
    private ISysMenuService menuService;

    @Autowired
    private ISysUserService userService;

    @Autowired
    private ITokenService tokenService;

    @Autowired
    private SysPermissionService permissionService;

    /** 角色分页列表 */
    @PreAuthorize("@ss.hasPermi('system:role:list')")
    @Operation(summary = "角色分页列表")
    @PostMapping("/pageQuery")
    public AjaxResult pageQuery(@RequestBody(required = false) SysRole role)
    {
        startPage();
        List<SysRole> list = roleService.selectRoleList(role == null ? new SysRole() : role);
        return getDataTable(list);
    }

    /** 新增角色 */
    @PreAuthorize("@ss.hasPermi('system:role:edit')")
    @Log(title = "角色管理", businessType = BusinessType.INSERT)
    @Operation(summary = "新增角色")
    @PostMapping("/insert")
    public AjaxResult insert(@Validated @RequestBody SysRole role)
    {
        if (!roleService.checkRoleNameUnique(role))
        {
            return error("角色名称已存在");
        }
        if (!roleService.checkRoleKeyUnique(role))
        {
            return error("角色权限字符已存在");
        }
        return toAjax(roleService.insertRole(role));
    }

    /** 编辑角色 */
    @PreAuthorize("@ss.hasPermi('system:role:edit')")
    @Log(title = "角色管理", businessType = BusinessType.UPDATE, bizId = "#role.roleId")
    @Operation(summary = "编辑角色")
    @PostMapping("/update")
    public AjaxResult update(@Validated @RequestBody SysRole role)
    {
        if (!roleService.checkRoleNameUnique(role))
        {
            return error("角色名称已存在");
        }
        if (!roleService.checkRoleKeyUnique(role))
        {
            return error("角色权限字符已存在");
        }
        roleService.checkRoleAllowed(role);
        if (roleService.updateRole(role) > 0)
        {
            refreshLoginUserCache();
            return success();
        }
        return error("修改角色失败");
    }

    /** 角色详情 */
    @PreAuthorize("@ss.hasPermi('system:role:query')")
    @Operation(summary = "角色详情")
    @GetMapping("/detail")
    public AjaxResult detail(@RequestParam Long roleId)
    {
        return success(roleService.selectRoleById(roleId));
    }

    /** 更新角色状态 */
    @PreAuthorize("@ss.hasPermi('system:role:edit')")
    @Log(title = "角色管理", businessType = BusinessType.UPDATE, bizId = "#role.roleId")
    @Operation(summary = "更新角色状态")
    @PostMapping("/updateStatus")
    public AjaxResult updateStatus(@RequestBody SysRole role)
    {
        roleService.checkRoleAllowed(role);
        return toAjax(roleService.updateRoleStatus(role));
    }

    /** 角色已分配菜单 */
    @PreAuthorize("@ss.hasPermi('system:role:query')")
    @Operation(summary = "查询角色菜单")
    @GetMapping("/roleToMenu")
    public AjaxResult roleToMenu(@RequestParam Long roleId)
    {
        AjaxResult ajax = AjaxResult.success();
        ajax.put("checkedKeys", menuService.selectMenuListByRoleId(roleId));
        ajax.put("menus", menuService.buildMenuTreeSelect(menuService.selectMenuList(getUserId())));
        return ajax;
    }

    /** 保存角色菜单 */
    @PreAuthorize("@ss.hasPermi('system:role:edit')")
    @Log(title = "角色管理", businessType = BusinessType.GRANT, bizId = "#role.roleId")
    @Operation(summary = "保存角色菜单")
    @PostMapping("/saveMenuToRole")
    public AjaxResult saveMenuToRole(@RequestBody SysRole role)
    {
        roleService.checkRoleAllowed(role);
        return toAjax(roleService.updateRole(role));
    }

    /** 角色已分配用户 */
    @PreAuthorize("@ss.hasPermi('system:role:list')")
    @Operation(summary = "查询角色用户")
    @GetMapping("/roleToUser")
    public AjaxResult roleToUser(@RequestParam Long roleId)
    {
        startPage();
        SysUser user = new SysUser();
        user.setRoleId(roleId);
        List<SysUser> list = userService.selectAllocatedList(user);
        return getDataTable(list);
    }

    /** 保存角色用户 */
    @PreAuthorize("@ss.hasPermi('system:role:edit')")
    @Log(title = "角色管理", businessType = BusinessType.GRANT, bizId = "#body['roleId']")
    @Operation(summary = "保存角色用户")
    @PostMapping("/saveUserToRole")
    public AjaxResult saveUserToRole(@RequestBody Map<String, Object> body)
    {
        Long roleId = toLong(body.get("roleId"));
        Object userList = body.get("userList") != null ? body.get("userList") : body.get("userIds");
        Long[] userIds = toLongArray(userList);
        return toAjax(roleService.insertAuthUsers(roleId, userIds));
    }

    /** 取消角色用户授权 */
    @PreAuthorize("@ss.hasPermi('system:role:edit')")
    @Log(title = "角色管理", businessType = BusinessType.GRANT, bizId = "#body['roleId']")
    @Operation(summary = "取消角色用户")
    @PostMapping("/cancelUserToRole")
    public AjaxResult cancelUserToRole(@RequestBody Map<String, Object> body)
    {
        Long roleId = toLong(body.get("roleId"));
        Object userList = body.get("userList") != null ? body.get("userList") : body.get("userIds");
        Long[] userIds = toLongArray(userList);
        return toAjax(roleService.deleteAuthUsers(roleId, userIds));
    }

    /** 删除角色 */
    @PreAuthorize("@ss.hasPermi('system:role:remove')")
    @Log(title = "角色管理", businessType = BusinessType.DELETE, bizId = "#roleId")
    @Operation(summary = "删除角色")
    @GetMapping("/delete")
    public AjaxResult delete(@RequestParam Long roleId)
    {
        return toAjax(roleService.deleteRoleByIds(new Long[] { roleId }));
    }

    private void refreshLoginUserCache()
    {
        LoginUser loginUser = getLoginUser();
        if (StringUtils.isNotNull(loginUser.getUser()) && !loginUser.getUser().isAdmin())
        {
            loginUser.setUser(userService.selectUserByUserName(loginUser.getUser().getUserName()));
            loginUser.setPermissions(permissionService.getMenuPermission(loginUser.getUser()));
            tokenService.setLoginUser(loginUser);
        }
    }

    private Long toLong(Object value)
    {
        if (value == null)
        {
            return null;
        }
        if (value instanceof Number)
        {
            return ((Number) value).longValue();
        }
        return Long.parseLong(String.valueOf(value));
    }

    private Long[] toLongArray(Object value)
    {
        if (value == null)
        {
            return new Long[0];
        }
        if (value instanceof List<?> list)
        {
            return list.stream().map(this::toLong).toArray(Long[]::new);
        }
        if (value instanceof Object[] arr)
        {
            Long[] result = new Long[arr.length];
            for (int i = 0; i < arr.length; i++)
            {
                result[i] = toLong(arr[i]);
            }
            return result;
        }
        return new Long[] { toLong(value) };
    }
}
