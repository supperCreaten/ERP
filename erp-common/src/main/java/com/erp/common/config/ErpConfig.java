package com.erp.common.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

/**
 * 读取项目相关配置
 * 
 * @author finance
 */
@Component
@ConfigurationProperties(prefix = "erp")
public class ErpConfig
{
    /** 项目名称 */
    private String name;

    /** 版本 */
    private String version;

    /** 版权年份 */
    private String copyrightYear;

    /** 上传路径 */
    private static String profile;

    /** 获取地址开关 */
    private static boolean addressEnabled;

    /** 验证码类型 */
    private static String captchaType;

    /** 是否开启验证码 */
    private static boolean captchaEnabled = false;

    /** 是否开启用户注册 */
    private static boolean registerUser = false;

    /** 用户初始密码 */
    private static String initPassword = "123456";

    /** 初始密码是否强制修改（1强制 0不强制） */
    private static int initPasswordModify = 0;

    /** 密码有效期（天，0表示不过期） */
    private static int passwordValidateDays = 0;

    /** 登录IP黑名单（多个用;分隔） */
    private static String blackIPList = "";

    /**
     * Excel 导入是否允许部分成功入库。
     * true：校验/业务失败行跳过，成功行入库；
     * false：任一失败则全部回滚，成功行也不入库。
     */
    private static boolean importPartialCommit = false;

    public String getName()
    {
        return name;
    }

    public void setName(String name)
    {
        this.name = name;
    }

    public String getVersion()
    {
        return version;
    }

    public void setVersion(String version)
    {
        this.version = version;
    }

    public String getCopyrightYear()
    {
        return copyrightYear;
    }

    public void setCopyrightYear(String copyrightYear)
    {
        this.copyrightYear = copyrightYear;
    }

    public static String getProfile()
    {
        return profile;
    }

    public void setProfile(String profile)
    {
        ErpConfig.profile = profile;
    }

    public static boolean isAddressEnabled()
    {
        return addressEnabled;
    }

    public void setAddressEnabled(boolean addressEnabled)
    {
        ErpConfig.addressEnabled = addressEnabled;
    }

    public static String getCaptchaType() {
        return captchaType;
    }

    public void setCaptchaType(String captchaType) {
        ErpConfig.captchaType = captchaType;
    }

    public static boolean isCaptchaEnabled()
    {
        return captchaEnabled;
    }

    public void setCaptchaEnabled(boolean captchaEnabled)
    {
        ErpConfig.captchaEnabled = captchaEnabled;
    }

    public static boolean isRegisterUser()
    {
        return registerUser;
    }

    public void setRegisterUser(boolean registerUser)
    {
        ErpConfig.registerUser = registerUser;
    }

    public static String getInitPassword()
    {
        return initPassword;
    }

    public void setInitPassword(String initPassword)
    {
        ErpConfig.initPassword = initPassword;
    }

    public static int getInitPasswordModify()
    {
        return initPasswordModify;
    }

    public void setInitPasswordModify(int initPasswordModify)
    {
        ErpConfig.initPasswordModify = initPasswordModify;
    }

    public static int getPasswordValidateDays()
    {
        return passwordValidateDays;
    }

    public void setPasswordValidateDays(int passwordValidateDays)
    {
        ErpConfig.passwordValidateDays = passwordValidateDays;
    }

    public static String getBlackIPList()
    {
        return blackIPList;
    }

    public void setBlackIPList(String blackIPList)
    {
        ErpConfig.blackIPList = blackIPList;
    }

    public static boolean isImportPartialCommit()
    {
        return importPartialCommit;
    }

    public void setImportPartialCommit(boolean importPartialCommit)
    {
        ErpConfig.importPartialCommit = importPartialCommit;
    }

    /**
     * 获取导入上传路径
     */
    public static String getImportPath()
    {
        return getProfile() + "/import";
    }

    /**
     * 获取头像上传路径
     */
    public static String getAvatarPath()
    {
        return getProfile() + "/avatar";
    }

    /**
     * 获取下载路径
     */
    public static String getDownloadPath()
    {
        return getProfile() + "/download/";
    }

    /**
     * 获取上传路径
     */
    public static String getUploadPath()
    {
        return getProfile() + "/upload";
    }
}
