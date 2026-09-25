package com.erp.system.service.impl;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.erp.system.domain.SysOperLog;
import com.erp.system.mapper.SysOperLogMapper;
import com.erp.system.service.ISysOperLogService;

@Service
public class SysOperLogServiceImpl implements ISysOperLogService {
    @Autowired
    private SysOperLogMapper operLogMapper;

    @Override
    public void insertOperlog(SysOperLog operLog) {
        operLogMapper.insertOperlog(operLog);
    }

    @Override
    public List<SysOperLog> selectOperLogList(SysOperLog operLog) {
        return operLogMapper.selectOperLogList(operLog);
    }

    @Override
    public SysOperLog selectOperLogById(Long operId) {
        return operLogMapper.selectOperLogById(operId);
    }

    @Override
    public int deleteOperLogByIds(Long[] operIds) {
        return operLogMapper.deleteOperLogByIds(operIds);
    }

    @Override
    public void cleanOperLog() {
        operLogMapper.cleanOperLog();
    }

    @Override
    public void cleanOperLogByDays(int days) {
        operLogMapper.cleanOperLogByDays(days);
    }
}
