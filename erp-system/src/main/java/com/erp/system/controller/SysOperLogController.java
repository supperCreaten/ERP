package com.erp.system.controller;

import java.util.Map;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import com.erp.common.annotation.Log;
import com.erp.common.core.controller.BaseController;
import com.erp.common.core.domain.AjaxResult;
import com.erp.common.enums.BusinessType;
import com.erp.system.domain.SysOperLog;
import com.erp.system.service.ISysOperLogService;

/**
 * 操作日志
 */
@RestController
@Tag(name = "操作日志")
@RequestMapping("/operLog")
public class SysOperLogController extends BaseController
{
    @Autowired
    private ISysOperLogService operLogService;

    @PreAuthorize("@ss.hasPermi('system:operLog:list')")
    @Operation(summary = "操作日志分页")
    @PostMapping("/pageQuery")
    public AjaxResult pageQuery(@RequestBody(required = false) SysOperLog query)
    {
        startPage();
        return getDataTable(operLogService.selectOperLogList(query == null ? new SysOperLog() : query));
    }

    @PreAuthorize("@ss.hasPermi('system:operLog:query')")
    @Operation(summary = "操作日志详情")
    @GetMapping("/detail")
    public AjaxResult detail(@RequestParam Long operId)
    {
        return success(operLogService.selectOperLogById(operId));
    }

    @PreAuthorize("@ss.hasPermi('system:operLog:remove')")
    @Log(title = "操作日志", businessType = BusinessType.DELETE, bizId = "#body['operIds']")
    @Operation(summary = "删除操作日志")
    @PostMapping("/delete")
    public AjaxResult delete(@RequestBody Map<String, Object> body)
    {
        Object ids = body.get("operIds");
        if (ids instanceof java.util.Collection<?> collection)
        {
            Long[] operIds = collection.stream().map(v -> Long.valueOf(String.valueOf(v))).toArray(Long[]::new);
            return toAjax(operLogService.deleteOperLogByIds(operIds));
        }
        return error("参数不正确");
    }

    @PreAuthorize("@ss.hasPermi('system:operLog:remove')")
    @Log(title = "操作日志", businessType = BusinessType.CLEAN)
    @Operation(summary = "清空操作日志")
    @PostMapping("/clean")
    public AjaxResult clean(@RequestBody(required = false) Map<String, Object> body)
    {
        Integer days = null;
        if (body != null && body.get("days") != null)
        {
            days = Integer.valueOf(String.valueOf(body.get("days")));
        }
        if (days != null && days > 0)
        {
            operLogService.cleanOperLogByDays(days);
        }
        else
        {
            operLogService.cleanOperLog();
        }
        return success();
    }
}
