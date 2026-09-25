package com.erp.system.service;

import com.erp.system.domain.dto.CustomerAddDTO;
import com.erp.system.domain.dto.CustomerQueryDTO;
import com.erp.system.domain.vo.CustomerVO;

import java.util.List;

public interface SalesCustomerService {
    List<CustomerVO> selectCustomerList(CustomerQueryDTO customerQueryDTO);
    void insertSalesCustomer(CustomerAddDTO customerAddDTO);
    void updateSalesCustomer(CustomerAddDTO customerAddDTO);
    CustomerVO selectCustomerById(Long customerId);
    void deleteSalesCustomer(Long[] customerIds);
}
