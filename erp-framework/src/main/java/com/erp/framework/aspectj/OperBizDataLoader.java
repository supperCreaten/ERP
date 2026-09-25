package com.erp.framework.aspectj;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import com.erp.common.utils.StringUtils;
import com.erp.system.service.ISysLogininforService;
import com.erp.system.service.ISysMenuService;
import com.erp.system.service.ISysOperLogService;
import com.erp.system.service.ISysRoleService;
import com.erp.system.service.ISysUserService;

/**
 * 按模块标题加载业务旧数据，供操作日志字段对比
 */
@Component
public class OperBizDataLoader
{
    @Autowired
    private ISysUserService userService;

    @Autowired
    private ISysRoleService roleService;

    @Autowired
    private ISysMenuService menuService;

    @Autowired
    private ISysOperLogService operLogService;

    @Autowired
    private ISysLogininforService logininforService;


    public Object load(String title, Object bizId)
    {
        if (StringUtils.isEmpty(title) || bizId == null || "".equals(String.valueOf(bizId)))
        {
            return null;
        }
        Long id = toLong(bizId);
        if (id == null)
        {
            // 批量 id 列表
            if (bizId instanceof Long[] || bizId instanceof long[])
            {
                return loadBatch(title, toLongList(bizId));
            }
            if (bizId instanceof List)
            {
                return loadBatch(title, toLongList(bizId));
            }
            return null;
        }
        switch (title)
        {
            case "用户管理":
            case "用户头像":
            case "个人信息":
                return userService.selectUserById(id);
            case "角色管理":
                return roleService.selectRoleById(id);
            case "菜单管理":
                return menuService.selectMenuById(id);
            case "操作日志":
                return operLogService.selectOperLogById(id);
            case "登录日志":
                return logininforService.selectLogininforById(id);
            default:
                return null;
        }
    }

    private Object loadBatch(String title, List<Long> ids)
    {
        if (ids == null || ids.isEmpty())
        {
            return null;
        }
        List<Object> list = new ArrayList<>();
        for (Long id : ids)
        {
            Object one = load(title, id);
            if (one != null)
            {
                list.add(one);
            }
        }
        if (list.isEmpty())
        {
            return null;
        }
        Map<String, Object> wrap = new LinkedHashMap<>();
        wrap.put("ids", ids);
        wrap.put("records", list);
        return wrap;
    }

    private static Long toLong(Object value)
    {
        if (value instanceof Number)
        {
            return ((Number) value).longValue();
        }
        if (value instanceof String && StringUtils.isNotEmpty((String) value))
        {
            try
            {
                return Long.parseLong(((String) value).trim());
            }
            catch (NumberFormatException ignored)
            {
            }
        }
        return null;
    }

    private static List<Long> toLongList(Object value)
    {
        List<Long> ids = new ArrayList<>();
        if (value instanceof Long[])
        {
            for (Long id : (Long[]) value)
            {
                if (id != null)
                {
                    ids.add(id);
                }
            }
        }
        else if (value instanceof long[])
        {
            for (long id : (long[]) value)
            {
                ids.add(id);
            }
        }
        else if (value instanceof List)
        {
            for (Object item : (List<?>) value)
            {
                Long id = toLong(item);
                if (id != null)
                {
                    ids.add(id);
                }
            }
        }
        return ids;
    }
}
