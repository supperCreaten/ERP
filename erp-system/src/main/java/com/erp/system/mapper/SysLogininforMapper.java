package com.erp.system.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Param;
import com.erp.system.domain.SysLogininfor;

/**
 * 系统访问日志情况信息 数据层（表 sys_login_log）
 *
 * @author finance
 */
public interface SysLogininforMapper {
    /**
     * 新增系统登录日志
     *
     * @param logininfor 访问日志对象
     */
    public void insertLogininfor(SysLogininfor logininfor);

    /**
     * 查询系统登录日志集合
     *
     * @param logininfor 访问日志对象
     * @return 登录记录集合
     */
    public List<SysLogininfor> selectLogininforList(SysLogininfor logininfor);

    /**
     * 查询登录日志详情
     */
    public SysLogininfor selectLogininforById(Long infoId);

    /**
     * 批量删除系统登录日志
     *
     * @param infoIds 需要删除的登录日志ID
     * @return 结果
     */
    public int deleteLogininforByIds(@Param("infoIds") Long[] infoIds);

    /**
     * 清空系统登录日志
     *
     * @return 结果
     */
    public int cleanLogininfor();

    /**
     * 按天数清理
     */
    public int cleanLogininforByDays(@Param("days") int days);
}
