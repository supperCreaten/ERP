package com.erp.system.domain.vo;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;

/**
 * 授权路由节点（字段集不变；序列化顺序对齐若依：标识字段在前，children 在末）
 *
 * @author finance
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonPropertyOrder({ "menuId", "menuName", "path", "hidden", "menuType", "component", "meta", "children" })
public class AuthMenuVo
{
    private Long menuId;

    private String menuName;

    private String path;

    private boolean hidden;

    private Integer menuType;

    private String component;

    private Map<String, Object> meta;

    private List<AuthMenuVo> children;

    public Long getMenuId()
    {
        return menuId;
    }

    public void setMenuId(Long menuId)
    {
        this.menuId = menuId;
    }

    public String getMenuName()
    {
        return menuName;
    }

    public void setMenuName(String menuName)
    {
        this.menuName = menuName;
    }

    public String getPath()
    {
        return path;
    }

    public void setPath(String path)
    {
        this.path = path;
    }

    public boolean isHidden()
    {
        return hidden;
    }

    public void setHidden(boolean hidden)
    {
        this.hidden = hidden;
    }

    public Integer getMenuType()
    {
        return menuType;
    }

    public void setMenuType(Integer menuType)
    {
        this.menuType = menuType;
    }

    public String getComponent()
    {
        return component;
    }

    public void setComponent(String component)
    {
        this.component = component;
    }

    public Map<String, Object> getMeta()
    {
        return meta;
    }

    public void setMeta(Map<String, Object> meta)
    {
        this.meta = meta;
    }

    public List<AuthMenuVo> getChildren()
    {
        return children;
    }

    public void setChildren(List<AuthMenuVo> children)
    {
        this.children = children;
    }

    public static Map<String, Object> buildMeta(String title, String icon, int keepAlive)
    {
        Map<String, Object> meta = new LinkedHashMap<>(4);
        meta.put("title", title);
        meta.put("icon", icon);
        meta.put("keepAlive", keepAlive);
        return meta;
    }
}
