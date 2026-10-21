package com.erp.system.service.impl;

import com.erp.common.exception.ServiceException;
import com.erp.system.domain.dto.SalesOrderAddDTO;
import com.erp.system.domain.dto.SalesOrderItemDTO;
import com.erp.system.mapper.SalesOrderItemMapper;
import com.erp.system.mapper.SalesOrderMapper;
import com.erp.system.service.SalesOrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.CollectionUtils;
import java.util.List;

@Service
public class SalesOrderServiceImpl implements SalesOrderService {
    @Autowired
    private SalesOrderMapper salesOrderMapper;
    @Autowired
    private SalesOrderItemMapper salesOrderItemMapper;

    @Transactional
    public void insertSalesOrder(SalesOrderAddDTO salesOrderAddDTO) {
        List<SalesOrderItemDTO> items = salesOrderAddDTO.getItems();

    }
}
