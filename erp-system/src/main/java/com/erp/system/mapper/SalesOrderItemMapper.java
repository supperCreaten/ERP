package com.erp.system.mapper;

import com.erp.system.domain.dto.SalesOrderItemDTO;
import com.erp.system.domain.vo.SalesOrderItemVO;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * 销售订单明细 数据层
 */
public interface SalesOrderItemMapper {

    /**
     * 根据订单ID查询明细列表
     *
     * @param orderId 订单ID
     * @return 明细集合
     */
    List<SalesOrderItemVO> selectItemsByOrderId(Long orderId);

    /**
     * 新增明细
     *
     * @param item 明细信息
     * @return 影响行数
     */
    int insertSalesOrderItem(SalesOrderItemDTO item);

    /**
     * 批量新增明细
     *
     * @param items 明细列表
     * @return 影响行数
     */
    int batchInsertSalesOrderItem(@Param("items") List<SalesOrderItemDTO> items);

    /**
     * 修改明细
     *
     * @param item 明细信息
     * @return 影响行数
     */
    int updateSalesOrderItem(SalesOrderItemDTO item);

    /**
     * 按订单ID逻辑删除全部明细
     *
     * @param orderId 订单ID
     * @return 影响行数
     */
    int deleteItemsByOrderId(Long orderId);

    /**
     * 按订单ID批量逻辑删除明细
     *
     * @param orderIds 订单ID数组
     * @return 影响行数
     */
    int deleteItemsByOrderIds(Long[] orderIds);

    /**
     * 按明细ID批量逻辑删除
     *
     * @param itemIds 明细ID数组
     * @return 影响行数
     */
    int deleteItemsByIds(Long[] itemIds);
}
