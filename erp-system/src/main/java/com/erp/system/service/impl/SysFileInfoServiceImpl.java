package com.erp.system.service.impl;

import org.apache.commons.io.FilenameUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import com.erp.common.utils.StringUtils;
import com.erp.common.utils.file.FileUtils;
import com.erp.system.domain.SysFileInfo;
import com.erp.system.mapper.SysFileInfoMapper;
import com.erp.system.service.ISysFileInfoService;

/**
 * 上传文件元数据 服务实现
 *
 * @author finance
 */
@Service
public class SysFileInfoServiceImpl implements ISysFileInfoService {
    @Autowired
    private SysFileInfoMapper fileInfoMapper;

    @Override
    public SysFileInfo saveUploadFile(MultipartFile file, String storedPath, String url) {
        SysFileInfo info = new SysFileInfo();
        info.setOriginalFilename(file.getOriginalFilename());
        info.setFileName(storedPath);
        info.setNewFileName(FileUtils.getName(storedPath));
        info.setUrl(url);
        info.setFileSize(file.getSize());
        info.setFileType(FilenameUtils.getExtension(file.getOriginalFilename()));
        info.setContentType(StringUtils.nvl(file.getContentType(), ""));
        fileInfoMapper.insertFile(info);
        return info;
    }

    @Override
    public SysFileInfo selectFileById(Long fileId) {
        return fileInfoMapper.selectFileById(fileId);
    }
}
