package com.erp.system.mapper;

import com.erp.system.domain.dto.SalesOrderAddDTO;
import com.erp.system.domain.dto.SalesOrderQueryDTO;
import com.erp.system.domain.vo.SalesOrderVO;

import java.util.List;

/**
 * 销售订单 数据层
 */
public interface SalesOrderMapper {

    /**
     * 查询销售订单列表
     *
     * @param query 查询条件
     * @return 订单集合
     */
    List<SalesOrderVO> selectSalesOrderList(SalesOrderQueryDTO query);

    /**
     * 根据订单ID查询详情
     *
     * @param orderId 订单ID
     * @return 订单详情
     */
    SalesOrderVO selectSalesOrderById(Long orderId);

    /**
     * 根据订单号查询
     *
     * @param orderNo 订单号
     * @return 订单详情
     */
    SalesOrderVO selectSalesOrderByOrderNo(String orderNo);

    /**
     * 新增销售订单
     *
     * @param order 订单信息
     * @return 影响行数
     */
    int insertSalesOrder(SalesOrderAddDTO order);

    /**
     * 修改销售订单
     *
     * @param order 订单信息
     * @return 影响行数
     */
    int updateSalesOrder(SalesOrderAddDTO order);

    /**
     * 批量逻辑删除销售订单
     *
     * @param orderIds 订单ID数组
     * @return 影响行数
     */
    int deleteSalesOrderByIds(Long[] orderIds);
}
