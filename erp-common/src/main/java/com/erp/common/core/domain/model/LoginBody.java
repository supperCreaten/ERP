package com.erp.common.core.domain.model;

/**
 * 用户登录对象（对齐前端 /api/login：account + password）
 *
 * @author finance
 */
public class LoginBody
{
    /** 登录账号（前端字段 account，可能为 AES 密文） */
    private String account;

    /** 兼容旧字段 username */
    private String username;

    /** 用户密码（可能为 AES 密文） */
    private String password;

    public String getAccount()
    {
        return account != null ? account : username;
    }

    public void setAccount(String account)
    {
        this.account = account;
    }

    public String getUsername()
    {
        return username != null ? username : account;
    }

    public void setUsername(String username)
    {
        this.username = username;
    }

    public String getPassword()
    {
        return password;
    }

    public void setPassword(String password)
    {
        this.password = password;
    }
}
