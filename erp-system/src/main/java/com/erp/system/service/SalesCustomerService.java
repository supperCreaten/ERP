package com.erp.system.service;

import com.erp.system.domain.dto.CustomerAddDTO;
import com.erp.system.domain.dto.CustomerExcelDTO;
import com.erp.system.domain.dto.CustomerQueryDTO;
import com.erp.system.domain.vo.CustomerVO;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

/**
 * 客户资料业务层
 */
public interface SalesCustomerService {

    /**
     * 查询客户列表
     *
     * @param customerQueryDTO 查询条件
     * @return 客户集合
     */
    List<CustomerVO> selectCustomerList(CustomerQueryDTO customerQueryDTO);

    /**
     * 新增客户资料
     *
     * @param customerAddDTO 客户信息
     */
    void insertSalesCustomer(CustomerAddDTO customerAddDTO);

    /**
     * 修改客户资料
     *
     * @param customerAddDTO 客户信息
     */
    void updateSalesCustomer(CustomerAddDTO customerAddDTO);

    /**
     * 根据客户ID查询详情
     *
     * @param customerId 客户ID
     * @return 客户详情
     */
    CustomerVO selectCustomerById(Long customerId);

    /**
     * 批量删除客户
     *
     * @param customerIds 客户ID数组
     */
    void deleteSalesCustomer(Long[] customerIds);

    /**
     * 导入客户资料
     *
     * @param file           Excel 文件
     * @param partialCommit  是否允许部分成功入库
     * @return 导入结果（含错误文件 base64）
     */
    Map<String, Object> importCustomers(MultipartFile file, boolean partialCommit);

    /**
     * 查询并转换为导出数据
     *
     * @param customerQueryDTO 查询条件
     * @return 导出行
     */
    List<CustomerExcelDTO> selectCustomerExportList(CustomerQueryDTO customerQueryDTO);
}
