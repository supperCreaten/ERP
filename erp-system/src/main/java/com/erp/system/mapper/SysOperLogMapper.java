package com.erp.system.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Param;
import com.erp.system.domain.SysOperLog;

public interface SysOperLogMapper {
    void insertOperlog(SysOperLog operLog);

    List<SysOperLog> selectOperLogList(SysOperLog operLog);

    SysOperLog selectOperLogById(Long operId);

    int deleteOperLogByIds(@Param("operIds") Long[] operIds);

    int cleanOperLog();

    int cleanOperLogByDays(@Param("days") int days);
}
