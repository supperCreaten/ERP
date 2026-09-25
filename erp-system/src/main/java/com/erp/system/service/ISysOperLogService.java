package com.erp.system.service;

import java.util.List;
import com.erp.system.domain.SysOperLog;

public interface ISysOperLogService
{
    void insertOperlog(SysOperLog operLog);

    List<SysOperLog> selectOperLogList(SysOperLog operLog);

    SysOperLog selectOperLogById(Long operId);

    int deleteOperLogByIds(Long[] operIds);

    void cleanOperLog();

    void cleanOperLogByDays(int days);
}
