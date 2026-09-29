package com.erp.system.mapper;

import com.erp.system.domain.dto.CustomerAddDTO;
import com.erp.system.domain.dto.CustomerQueryDTO;
import com.erp.system.domain.vo.CustomerVO;

import java.util.List;

/**
 * 客户信息 数据层
 */
public interface CustomerMapper {

    /**
     * 查询客户列表
     *
     * @param query 查询条件
     * @return 客户集合
     */
    List<CustomerVO> selectCustomerList(CustomerQueryDTO query);

    /**
     * 根据客户ID查询详情
     *
     * @param customerId 客户ID
     * @return 客户详情
     */
    CustomerVO selectCustomerById(Long customerId);

    /**
     * 根据客户名称（及省市）查询客户，用于唯一性校验
     *
     * @param query 查询条件
     * @return 客户详情
     */
    CustomerVO selectCustomerByCustomerName(CustomerQueryDTO query);

    /**
     * 新增客户
     *
     * @param customer 客户信息
     * @return 影响行数
     */
    int insertCustomer(CustomerAddDTO customer);

    /**
     * 修改客户
     *
     * @param customer 客户信息
     * @return 影响行数
     */
    int updateCustomer(CustomerAddDTO customer);

    /**
     * 批量逻辑删除客户
     *
     * @param customerIds 客户ID数组
     * @return 影响行数
     */
    int deleteCustomerByIds(Long[] customerIds);
}
