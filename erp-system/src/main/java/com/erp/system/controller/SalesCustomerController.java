package com.erp.system.controller;

import com.erp.common.annotation.Log;
import com.erp.common.core.controller.BaseController;
import com.erp.common.core.domain.AjaxResult;
import com.erp.common.enums.BusinessType;
import com.erp.system.domain.dto.CustomerAddDTO;
import com.erp.system.domain.dto.CustomerQueryDTO;
import com.erp.system.domain.vo.CustomerVO;
import com.erp.system.service.SalesCustomerService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@Tag(name = "客户资料")
@RequestMapping("/customer")
public class SalesCustomerController extends BaseController {
    @Autowired
    private SalesCustomerService customerService;

    @Operation(summary = "创建客户资料")
    @Log(title = "客户资料", businessType = BusinessType.INSERT)
    @PostMapping("/pageQuery")
    public AjaxResult pageQuery(CustomerQueryDTO customerQueryDTO) {
        try {
            startPage();
            List<CustomerVO> items = customerService.selectCustomerList(customerQueryDTO);
            return getDataTable(items);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    @Operation(summary = "创建客户资料")
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


    @Operation(summary = "客户资料详情")
    @PostMapping("/queryById/{customerId}")
    public AjaxResult queryById( @PathVariable  Long customerId) {
        try {
           CustomerVO data = customerService.selectCustomerById(customerId);
            return success(data);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}
