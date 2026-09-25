package com.erp.system.service;

import org.springframework.web.multipart.MultipartFile;
import com.erp.system.domain.SysFileInfo;

/**
 * 上传文件元数据 服务层
 *
 * @author finance
 */
public interface ISysFileInfoService {
    /**
     * 保存上传文件元数据
     *
     * @param file 原始上传文件
     * @param storedPath 存储路径（/profile/upload/...）
     * @param url 完整访问 URL
     * @return 已落库记录（含 fileId）
     */
    SysFileInfo saveUploadFile(MultipartFile file, String storedPath, String url);

    /**
     * 按主键查询
     */
    SysFileInfo selectFileById(Long fileId);
}
