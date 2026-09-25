package com.erp.system.controller;

import java.util.List;

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
import com.erp.common.constant.UserConstants;
import com.erp.common.core.controller.BaseController;
import com.erp.common.core.domain.AjaxResult;
import com.erp.common.core.domain.entity.SysMenu;
import com.erp.common.enums.BusinessType;
import com.erp.common.utils.StringUtils;
import com.erp.system.service.ISysMenuService;

/**
 * 菜单管理（对齐 server /api/menu，无重复接口）
 *
 * @author finance
 */
@RestController
@Tag(name = "菜单管理")
@RequestMapping("/menu")
public class SysMenuController extends BaseController {
    @Autowired
    private ISysMenuService menuService;

    /**
     * 菜单列表（仅 is_del=0，树形结构，含按钮）
     */
    @PreAuthorize("@ss.hasPermi('system:menu:list')")
    @Operation(summary = "菜单列表")
    @PostMapping("/pageQuery")
    public AjaxResult pageQuery(@RequestBody(required = false) SysMenu menu) {
        List<SysMenu> menus = menuService.selectMenuList(menu == null ? new SysMenu() : menu, getUserId());
        return success(menuService.buildMenuTree(menus));
    }

    /**
     * 新增菜单
     */
    @PreAuthorize("@ss.hasPermi('system:menu:edit')")
    @Log(title = "菜单管理", businessType = BusinessType.INSERT)
    @Operation(summary = "新增菜单")
    @PostMapping("/insert")
    public AjaxResult insert(@Validated @RequestBody SysMenu menu) {
        if (!menuService.checkMenuNameUnique(menu)) {
            return error("菜单名称已存在");
        }
        if (UserConstants.YES_FRAME.equals(menu.getIsFrame()) && !StringUtils.ishttp(menu.getPath())) {
            return error("地址必须以http(s)://开头");
        }
        if (!menuService.checkRouteConfigUnique(menu)) {
            return error("路由名称或地址已存在");
        }
        return toAjax(menuService.insertMenu(menu));
    }

    /**
     * 编辑菜单
     */
    @PreAuthorize("@ss.hasPermi('system:menu:edit')")
    @Log(title = "菜单管理", businessType = BusinessType.UPDATE, bizId = "#menu.menuId")
    @Operation(summary = "编辑菜单")
    @PostMapping("/update")
    public AjaxResult update(@Validated @RequestBody SysMenu menu) {
        if (!menuService.checkMenuNameUnique(menu)) {
            return error("菜单名称已存在");
        }
        if (UserConstants.YES_FRAME.equals(menu.getIsFrame()) && !StringUtils.ishttp(menu.getPath())) {
            return error("地址必须以http(s)://开头");
        }
        if (!menuService.checkRouteConfigUnique(menu)) {
            return error("路由名称或地址已存在");
        }
        if (menu.getMenuId().equals(menu.getParentId())) {
            return error("上级菜单不能选择自己");
        }
        return toAjax(menuService.updateMenu(menu));
    }

    /**
     * 菜单详情
     */
    @PreAuthorize("@ss.hasPermi('system:menu:query')")
    @Operation(summary = "菜单详情")
    @GetMapping("/detail")
    public AjaxResult detail(@RequestParam Long menuId) {
        return success(menuService.selectMenuById(menuId));
    }

    /**
     * 删除菜单
     */
    @PreAuthorize("@ss.hasPermi('system:menu:remove')")
    @Log(title = "菜单管理", businessType = BusinessType.DELETE, bizId = "#menuId")
    @Operation(summary = "删除菜单")
    @GetMapping("/delete")
    public AjaxResult delete(@RequestParam Long menuId) {
        if (menuService.hasChildByMenuId(menuId)) {
            return warn("存在子菜单,不允许删除");
        }
        if (menuService.checkMenuExistRole(menuId)) {
            return warn("菜单已分配,不允许删除");
        }
        return toAjax(menuService.deleteMenuById(menuId));
    }
}
