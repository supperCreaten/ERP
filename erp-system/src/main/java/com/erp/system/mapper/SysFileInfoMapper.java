package com.erp.system.mapper;

import com.erp.system.domain.SysFileInfo;

/**
 * 上传文件元数据 数据层
 *
 * @author finance
 */
public interface SysFileInfoMapper {
    /**
     * 新增文件记录
     */
    int insertFile(SysFileInfo fileInfo);

    /**
     * 按主键查询
     */
    SysFileInfo selectFileById(Long fileId);
}
