package com.erp.common.core.page;

import com.alibaba.fastjson2.JSON;
import com.alibaba.fastjson2.JSONObject;
import com.erp.common.core.text.Convert;
import com.erp.common.filter.RepeatedlyRequestWrapper;
import com.erp.common.utils.ServletUtils;
import com.erp.common.utils.StringUtils;
import com.erp.common.utils.http.HttpHelper;
import jakarta.servlet.http.HttpServletRequest;

/**
 * 表格数据处理（对齐前端分页：currentPage + pageSize，支持 JSON body）
 *
 * @author finance
 */
public class TableSupport
{
    /** 当前页（RuoYi 兼容） */
    public static final String PAGE_NUM = "pageNum";

    /** 当前页（前端 / server） */
    public static final String CURRENT_PAGE = "currentPage";

    /** 兼容字段 page */
    public static final String PAGE = "page";

    /** 每页显示记录数 */
    public static final String PAGE_SIZE = "pageSize";

    /** 排序列 */
    public static final String ORDER_BY_COLUMN = "orderByColumn";

    /** 排序的方向 "desc" 或者 "asc". */
    public static final String IS_ASC = "isAsc";

    /** 分页参数合理化 */
    public static final String REASONABLE = "reasonable";

    /**
     * 封装分页对象
     */
    public static PageDomain getPageDomain()
    {
        PageDomain pageDomain = new PageDomain();
        Integer pageNum = firstInt(PAGE_NUM, CURRENT_PAGE, PAGE);
        Integer pageSize = firstInt(PAGE_SIZE);
        pageDomain.setPageNum(pageNum != null ? pageNum : 1);
        pageDomain.setPageSize(pageSize != null ? pageSize : 10);
        pageDomain.setOrderByColumn(firstStr(ORDER_BY_COLUMN));
        pageDomain.setIsAsc(firstStr(IS_ASC));
        Boolean reasonable = Convert.toBool(ServletUtils.getParameter(REASONABLE), null);
        if (reasonable == null)
        {
            reasonable = bodyBool(REASONABLE);
        }
        pageDomain.setReasonable(reasonable);
        return pageDomain;
    }

    public static PageDomain buildPageRequest()
    {
        return getPageDomain();
    }

    private static Integer firstInt(String... names)
    {
        for (String name : names)
        {
            Integer fromParam = Convert.toInt(ServletUtils.getParameter(name), null);
            if (fromParam != null)
            {
                return fromParam;
            }
            Integer fromBody = bodyInt(name);
            if (fromBody != null)
            {
                return fromBody;
            }
        }
        return null;
    }

    private static String firstStr(String name)
    {
        String fromParam = ServletUtils.getParameter(name);
        if (StringUtils.isNotEmpty(fromParam))
        {
            return fromParam;
        }
        return bodyStr(name);
    }

    private static JSONObject bodyJson()
    {
        try
        {
            HttpServletRequest request = ServletUtils.getRequest();
            if (!(request instanceof RepeatedlyRequestWrapper))
            {
                return null;
            }
            String body = HttpHelper.getBodyString(request);
            if (StringUtils.isEmpty(body) || !body.trim().startsWith("{"))
            {
                return null;
            }
            return JSON.parseObject(body);
        }
        catch (Exception e)
        {
            return null;
        }
    }

    private static Integer bodyInt(String name)
    {
        JSONObject json = bodyJson();
        if (json == null || !json.containsKey(name))
        {
            return null;
        }
        return json.getInteger(name);
    }

    private static String bodyStr(String name)
    {
        JSONObject json = bodyJson();
        if (json == null || !json.containsKey(name))
        {
            return null;
        }
        return json.getString(name);
    }

    private static Boolean bodyBool(String name)
    {
        JSONObject json = bodyJson();
        if (json == null || !json.containsKey(name))
        {
            return null;
        }
        return json.getBoolean(name);
    }
}
