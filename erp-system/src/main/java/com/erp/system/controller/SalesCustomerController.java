package com.erp.system.controller;

import com.erp.common.annotation.Log;
import com.erp.common.core.controller.BaseController;
import com.erp.common.core.domain.AjaxResult;
import com.erp.common.enums.BusinessType;
import com.erp.common.utils.poi.ExcelImportHelper;
import com.erp.common.utils.poi.ExcelUtil;
import com.erp.system.domain.dto.CustomerAddDTO;
import com.erp.system.domain.dto.CustomerExcelDTO;
import com.erp.system.domain.dto.CustomerQueryDTO;
import com.erp.system.domain.vo.CustomerVO;
import com.erp.system.service.SalesCustomerService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

/**
 * 客户资料
 */
@RestController
@Tag(name = "客户资料")
@RequestMapping("/customer")
public class SalesCustomerController extends BaseController {

    @Autowired
    private SalesCustomerService customerService;

    /**
     * 分页查询客户列表
     *
     * @param customerQueryDTO 查询条件
     * @return 分页结果
     */
    @Operation(summary = "分页查询客户列表")
    @PostMapping("/pageQuery")
    public AjaxResult pageQuery(@RequestBody(required = false) CustomerQueryDTO customerQueryDTO) {
        try {
            if (customerQueryDTO == null) {
                customerQueryDTO = new CustomerQueryDTO();
            }
            startPage();
            List<CustomerVO> items = customerService.selectCustomerList(customerQueryDTO);
            return getDataTable(items);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    /**
     * 新增客户资料
     *
     * @param customerAddDTO 客户信息
     * @return 操作结果
     */
    @Operation(summary = "新增客户资料")
    @Log(title = "客户资料", businessType = BusinessType.INSERT)
    @PostMapping("/insert")
    public AjaxResult insert(@Validated @RequestBody CustomerAddDTO customerAddDTO) {
        try {
            customerService.insertSalesCustomer(customerAddDTO);
            return toAjax(true);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    /**
     * 修改客户资料
     *
     * @param customerAddDTO 客户信息
     * @return 操作结果
     */
    @Operation(summary = "修改客户资料")
    @Log(title = "客户资料", businessType = BusinessType.UPDATE)
    @PostMapping("/update")
    public AjaxResult update(@Validated @RequestBody CustomerAddDTO customerAddDTO) {
        try {
            customerService.updateSalesCustomer(customerAddDTO);
            return toAjax(true);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    /**
     * 查询客户资料详情
     *
     * @param customerId 客户ID
     * @return 客户详情
     */
    @Operation(summary = "客户资料详情")
    @PostMapping("/queryById/{customerId}")
    public AjaxResult queryById(@PathVariable Long customerId) {
        try {
            CustomerVO data = customerService.selectCustomerById(customerId);
            return success(data);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    /**
     * 删除客户
     *
     * @param customerIds 客户ID数组
     * @return 操作结果
     */
    @Operation(summary = "删除客户")
    @Log(title = "客户资料", businessType = BusinessType.DELETE)
    @PostMapping("/delete")
    public AjaxResult delete(@Validated @RequestBody Long[] customerIds) {
        try {
            customerService.deleteSalesCustomer(customerIds);
            return toAjax(true);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    /**
     * 下载客户导入模板
     */
    @Operation(summary = "下载客户导入模板")
    @PostMapping("/importTemplate")
    public void importTemplate(HttpServletResponse response) {
        ExcelImportHelper.writeTemplate(response, CustomerExcelDTO.class, "客户导入", "客户导入模板.xlsx");
    }

    /**
     * 导入客户资料
     *
     * @param file          Excel 文件
     * @param partialCommit 是否允许部分成功入库
     * @return 导入结果
     */
    @Operation(summary = "导入客户资料")
    @Log(title = "客户资料", businessType = BusinessType.IMPORT)
    @PostMapping("/import")
    public AjaxResult importData(@RequestParam("file") MultipartFile file,
                                 @RequestParam(value = "partialCommit", defaultValue = "false") boolean partialCommit) {
        Map<String, Object> data = customerService.importCustomers(file, partialCommit);
        String message = data.get("message") == null ? "导入完成" : String.valueOf(data.get("message"));
        return AjaxResult.success(message, data);
    }

    /**
     * 导出客户资料
     *
     * @param customerQueryDTO 查询条件（与列表一致）
     */
    @Operation(summary = "导出客户资料")
    @Log(title = "客户资料", businessType = BusinessType.EXPORT)
    @PostMapping("/export")
    public void export(HttpServletResponse response, @RequestBody(required = false) CustomerQueryDTO customerQueryDTO) {
        if (customerQueryDTO == null) {
            customerQueryDTO = new CustomerQueryDTO();
        }
        List<CustomerExcelDTO> list = customerService.selectCustomerExportList(customerQueryDTO);
        ExcelUtil<CustomerExcelDTO> util = new ExcelUtil<>(CustomerExcelDTO.class);
        util.exportExcel(response, list, "客户资料");
    }
}
