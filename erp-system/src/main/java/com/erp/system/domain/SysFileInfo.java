package com.erp.system.domain;

import com.erp.common.core.domain.BaseEntity;

/**
 * 上传文件元数据表 sys_file
 *
 * @author finance
 */
public class SysFileInfo extends BaseEntity {
    private static final long serialVersionUID = 1L;

    /** 文件主键 */
    private Long fileId;

    /** 原始文件名 */
    private String originalFilename;

    /** 存储路径（/profile/upload/...） */
    private String fileName;

    /** 磁盘文件名 */
    private String newFileName;

    /** 访问 URL */
    private String url;

    /** 文件大小（字节） */
    private Long fileSize;

    /** 扩展名/类型 */
    private String fileType;

    /** MIME */
    private String contentType;

    /** 删除标志（0正常 1删除） */
    private String isDel;

    public Long getFileId() {
        return fileId;
    }

    public void setFileId(Long fileId) {
        this.fileId = fileId;
    }

    public String getOriginalFilename() {
        return originalFilename;
    }

    public void setOriginalFilename(String originalFilename) {
        this.originalFilename = originalFilename;
    }

    public String getFileName() {
        return fileName;
    }

    public void setFileName(String fileName) {
        this.fileName = fileName;
    }

    public String getNewFileName() {
        return newFileName;
    }

    public void setNewFileName(String newFileName) {
        this.newFileName = newFileName;
    }

    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }

    public Long getFileSize() {
        return fileSize;
    }

    public void setFileSize(Long fileSize) {
        this.fileSize = fileSize;
    }

    public String getFileType() {
        return fileType;
    }

    public void setFileType(String fileType) {
        this.fileType = fileType;
    }

    public String getContentType() {
        return contentType;
    }

    public void setContentType(String contentType) {
        this.contentType = contentType;
    }

    public String getIsDel() {
        return isDel;
    }

    public void setIsDel(String isDel) {
        this.isDel = isDel;
    }
}
