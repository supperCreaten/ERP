package com.erp.system.service.impl;

import com.erp.common.exception.ServiceException;
import com.erp.common.utils.bean.BeanUtils;
import com.erp.system.domain.dto.CustomerAddDTO;
import com.erp.system.domain.dto.CustomerQueryDTO;
import com.erp.system.domain.vo.CustomerVO;
import com.erp.system.mapper.CustomerMapper;
import com.erp.system.service.SalesCustomerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.rmi.ServerException;
import java.util.ArrayList;
import java.util.List;

@Service
public class SalesCustomerServiceImpl implements SalesCustomerService {
    @Autowired
    private CustomerMapper customerMapper;

    private void checkRegionNotEmpty(CustomerAddDTO customerAddDTO) {
        List<String> region = customerAddDTO.getRegion();
        if (region != null && region.size() == 2) {
            customerAddDTO.setProvince(region.get(0));
            customerAddDTO.setCity(region.get(1));
        }
        if (customerAddDTO.getProvince() == null) {
            throw new ServiceException("省份不能为空");
        }
        if (customerAddDTO.getCity() == null) {
            throw new ServiceException("城市不能为空");
        }
    }

    public List<CustomerVO> selectCustomerList(CustomerQueryDTO customerQueryDTO) {
        List<String> region = customerQueryDTO.getRegion();
        if (region != null && region.size() == 3) {
            customerQueryDTO.setProvince(region.get(0));
            customerQueryDTO.setCity(region.get(1));
        }
        return customerMapper.selectCustomerList(customerQueryDTO);
    }

    public void insertSalesCustomer(CustomerAddDTO customerAddDTO) {
        checkRegionNotEmpty(customerAddDTO);
        customerMapper.insertCustomer(customerAddDTO);
    }

    public void updateSalesCustomer(CustomerAddDTO customerAddDTO) {
        if (customerAddDTO.getCustomerId() == null) {
            throw new ServiceException("主键ID不能为空");
        }
        checkRegionNotEmpty(customerAddDTO);
        customerMapper.updateCustomer(customerAddDTO);
    }

    public CustomerVO selectCustomerById(Long customerId) {
        if (customerId == null) {
            throw new ServiceException("主键ID不能为空");
        }
        List<String> region = new ArrayList<>();
        CustomerVO target = new CustomerVO();
        CustomerVO records = customerMapper.selectCustomerById(customerId);
        String province = records.getProvince();
        String city = records.getCity();
        region.add(province);
        region.add(city);
        records.setRegion(region);
        BeanUtils.copyBeanProp(target, records);
        return target;
    }

    public void deleteSalesCustomer(Long[] customerIds){
        if(customerIds == null || customerIds.length == 0){
            throw new ServiceException("主键id不能为空");
        }
        customerMapper.deleteCustomerByIds(customerIds);
    }
}
