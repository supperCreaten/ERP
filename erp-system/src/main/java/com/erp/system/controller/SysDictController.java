package com.erp.system.controller;

import com.erp.common.annotation.Log;
import com.erp.common.core.controller.BaseController;
import com.erp.common.core.domain.AjaxResult;
import com.erp.common.enums.BusinessType;
import com.erp.system.domain.dto.SysDictDataSaveReq;
import com.erp.system.domain.dto.SysDictQuery;
import com.erp.system.domain.dto.SysDictSaveReq;
import com.erp.system.service.SysDictService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@Tag(name = "字典管理")
@RequestMapping("/dict")
public class SysDictController extends BaseController {
    @Autowired
    private SysDictService dictService;

    /**
     * 字典列表
     */
    @Operation(summary = "字典列表")
    @PostMapping("/pageQuery")
    public AjaxResult pageQuery(@RequestBody(required = false) SysDictQuery query) {
        startPage();
        List<SysDictSaveReq> items = dictService.selectDictList(query);
        return getDataTable(items);
    }

    /**
     * 按编码查询字典项
     */
    @Operation(summary = "按编码查询字典项")
    @PostMapping("/allDict")
    public AjaxResult allDict(@RequestBody(required = false) SysDictQuery query) {
        String dictCode = query == null ? null : query.getDictCode();
        List<SysDictDataSaveReq> dictData = dictService.selectDictDataByCode(dictCode);
        return success(dictData);
    }

    /**
     * 新增字典
     */
    @Log(title = "字典管理", businessType = BusinessType.INSERT)
    @Operation(summary = "新增字典")
    @PostMapping("/insert")
    public AjaxResult insert(@Validated @RequestBody SysDictSaveReq req) {
        try {
            dictService.insertDict(req);
            return toAjax(true);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    /**
     * 更新字典
     */
    @Log(title = "字典管理", businessType = BusinessType.UPDATE, bizId = "#req.dictId")
    @Operation(summary = "更新字典")
    @PostMapping("/update")
    public AjaxResult update(@Validated @RequestBody SysDictSaveReq req) {
        try {
            dictService.updateDict(req);
            return toAjax(true);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    /**
     * 字典详情
     */
    @PreAuthorize("@ss.hasPermi('system:menu:list')")
    @Operation(summary = "字典详情")
    @PostMapping("/queryById/{id}")
    public AjaxResult queryById(@Validated @PathVariable Long id) {
        SysDictSaveReq dict = dictService.selectDictByDictId(id);
        return success(dict);
    }

    /**
     * 删除字典
     */
    @PreAuthorize("@ss.hasPermi('system:menu:remove')")
    @Log(title = "字典管理", businessType = BusinessType.DELETE, bizId = "#dictId")
    @Operation(summary = "删除字典")
    @GetMapping("/delete")
    public AjaxResult delete(@RequestParam List<Long> ids) {
        try {
            dictService.deleteDictById(ids);
            return toAjax(true);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}
