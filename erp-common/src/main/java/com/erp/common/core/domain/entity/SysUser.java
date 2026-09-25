package com.erp.common.core.domain.entity;

import java.util.Date;
import java.util.List;
import jakarta.validation.constraints.*;
import org.apache.commons.lang3.builder.ToStringBuilder;
import org.apache.commons.lang3.builder.ToStringStyle;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.erp.common.annotation.Excel;
import com.erp.common.annotation.Excel.ColumnType;
import com.erp.common.annotation.Excel.Type;
import com.erp.common.core.domain.BaseEntity;
import com.erp.common.utils.SecurityUtils;
import com.erp.common.xss.Xss;

/**
 * 用户对象（登录账号表 sys_user）
 * 
 * @author finance
 */
public class SysUser extends BaseEntity
{
    private static final long serialVersionUID = 1L;

    /** 用户ID */
    @Excel(name = "用户序号", type = Type.EXPORT, cellType = ColumnType.NUMERIC, prompt = "用户编号")
    private Long userId;

    /** 登录账号（表字段 account） */
    @Excel(name = "登录名称")
    private String account;

    /** 登录账号兼容字段（查询时由 account 填充，写入时同步 account） */
    private String userName;

    /** 显示名（表字段 user_name） */
    @Excel(name = "用户名称")
    private String nickName;

    /** 用户邮箱 */
    @Excel(name = "用户邮箱")
    private String email;

    /** 手机号码（表字段 phone） */
    @Excel(name = "手机号码", cellType = ColumnType.TEXT)
    private String phonenumber;

    /** 用户性别（男/女） */
    @Excel(name = "用户性别")
    private String sex;

    /** 年龄 */
    private Integer age;

    /** 地址 */
    private String address;

    /** 员工工号 */
    private String employeeNo;

    /** 身份证号 */
    private String idCard;

    /** 学历 */
    private String education;

    /** 手机号密文 */
    private String phoneCipher;

    /** 手机号解密密钥 */
    private String phoneSecretKey;

    /** 身份证密文 */
    private String idCardCipher;

    /** 身份证解密密钥 */
    private String idCardSecretKey;

    /** 用户头像缩略图（查询 TO_BASE64） */
    private String avatar;

    /** 用户头像原图（查询 TO_BASE64） */
    private String fullAvatar;

    /** 角色名称（扁平字段，多角色逗号分隔） */
    private String roleName;

    /** 密码（表字段 password_hash） */
    private String password;

    /** 账号状态（0启用 1禁用） */
    @Excel(name = "账号状态", readConverterExp = "0=启用,1=禁用")
    private String status;

    /** 删除标志（表字段 is_del：0正常 1删除） */
    private String isDel;

    /** 兼容旧代码的删除标志（非表字段，可由 isDel 同步） */
    private String delFlag;

    /** 最后登录IP（非表字段） */
    @Excel(name = "最后登录IP", type = Type.EXPORT)
    private String loginIp;

    /** 最后登录时间（非表字段） */
    @Excel(name = "最后登录时间", width = 30, dateFormat = "yyyy-MM-dd HH:mm:ss", type = Type.EXPORT)
    private Date loginDate;

    /** 密码最后更新时间（非表字段） */
    private Date pwdUpdateDate;

    /** 角色对象（userInfo 等接口不返回，置空后由 JsonInclude 省略） */
    @JsonInclude(JsonInclude.Include.NON_EMPTY)
    private List<SysRole> roles;

    /** 角色组 */
    private Long[] roleIds;

    /** 角色ID */
    private Long roleId;

    public SysUser()
    {

    }

    public SysUser(Long userId)
    {
        this.userId = userId;
    }

    public Long getUserId()
    {
        return userId;
    }

    public void setUserId(Long userId)
    {
        this.userId = userId;
    }

    public boolean isAdmin()
    {
        return SecurityUtils.isAdmin(this.userId);
    }

    public String getAccount()
    {
        return account;
    }

    public void setAccount(String account)
    {
        this.account = account;
        if (StringUtilsIsEmpty(this.userName))
        {
            this.userName = account;
        }
    }

    @Xss(message = "用户昵称不能包含脚本字符")
    @Size(min = 0, max = 30, message = "用户昵称长度不能超过30个字符")
    public String getNickName()
    {
        return nickName;
    }

    public void setNickName(String nickName)
    {
        this.nickName = nickName;
    }

    @Xss(message = "用户账号不能包含脚本字符")
    @NotBlank(message = "用户账号不能为空")
    @Size(min = 0, max = 30, message = "用户账号长度不能超过30个字符")
    public String getUserName()
    {
        return userName != null ? userName : account;
    }

    public void setUserName(String userName)
    {
        this.userName = userName;
        if (StringUtilsIsEmpty(this.account))
        {
            this.account = userName;
        }
    }

    @Email(message = "邮箱格式不正确")
    @Size(min = 0, max = 50, message = "邮箱长度不能超过50个字符")
    public String getEmail()
    {
        return email;
    }

    public void setEmail(String email)
    {
        this.email = email;
    }

    @JsonProperty("phone")
    @Size(min = 0, max = 11, message = "手机号码长度不能超过11个字符")
    public String getPhonenumber()
    {
        return phonenumber;
    }

    @JsonProperty("phone")
    public void setPhonenumber(String phonenumber)
    {
        this.phonenumber = phonenumber;
    }

    public String getSex()
    {
        return sex;
    }

    public void setSex(String sex)
    {
        this.sex = sex;
    }

    public Integer getAge()
    {
        return age;
    }

    public void setAge(Integer age)
    {
        this.age = age;
    }

    public String getAddress()
    {
        return address;
    }

    public void setAddress(String address)
    {
        this.address = address;
    }

    public String getEmployeeNo()
    {
        return employeeNo;
    }

    public void setEmployeeNo(String employeeNo)
    {
        this.employeeNo = employeeNo;
    }

    @Size(min = 0, max = 18, message = "身份证号长度不能超过18个字符")
    public String getIdCard()
    {
        return idCard;
    }

    public void setIdCard(String idCard)
    {
        this.idCard = idCard;
    }

    public String getEducation()
    {
        return education;
    }

    public void setEducation(String education)
    {
        this.education = education;
    }

    public String getPhoneCipher()
    {
        return phoneCipher;
    }

    public void setPhoneCipher(String phoneCipher)
    {
        this.phoneCipher = phoneCipher;
    }

    public String getPhoneSecretKey()
    {
        return phoneSecretKey;
    }

    public void setPhoneSecretKey(String phoneSecretKey)
    {
        this.phoneSecretKey = phoneSecretKey;
    }

    public String getIdCardCipher()
    {
        return idCardCipher;
    }

    public void setIdCardCipher(String idCardCipher)
    {
        this.idCardCipher = idCardCipher;
    }

    public String getIdCardSecretKey()
    {
        return idCardSecretKey;
    }

    public void setIdCardSecretKey(String idCardSecretKey)
    {
        this.idCardSecretKey = idCardSecretKey;
    }

    public String getAvatar()
    {
        return avatar;
    }

    public void setAvatar(String avatar)
    {
        this.avatar = avatar;
    }

    public String getFullAvatar()
    {
        return fullAvatar;
    }

    public void setFullAvatar(String fullAvatar)
    {
        this.fullAvatar = fullAvatar;
    }

    public String getRoleName()
    {
        return roleName;
    }

    public void setRoleName(String roleName)
    {
        this.roleName = roleName;
    }

    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    public String getPassword()
    {
        return password;
    }

    public void setPassword(String password)
    {
        this.password = password;
    }

    public String getStatus()
    {
        return status;
    }

    public void setStatus(String status)
    {
        this.status = status;
    }

    public String getIsDel()
    {
        return isDel;
    }

    public void setIsDel(String isDel)
    {
        this.isDel = isDel;
        this.delFlag = isDel;
    }

    public String getDelFlag()
    {
        return delFlag != null ? delFlag : isDel;
    }

    public void setDelFlag(String delFlag)
    {
        this.delFlag = delFlag;
        this.isDel = delFlag;
    }

    public String getLoginIp()
    {
        return loginIp;
    }

    public void setLoginIp(String loginIp)
    {
        this.loginIp = loginIp;
    }

    public Date getLoginDate()
    {
        return loginDate;
    }

    public void setLoginDate(Date loginDate)
    {
        this.loginDate = loginDate;
    }

    public Date getPwdUpdateDate()
    {
        return pwdUpdateDate;
    }

    public void setPwdUpdateDate(Date pwdUpdateDate)
    {
        this.pwdUpdateDate = pwdUpdateDate;
    }

    public List<SysRole> getRoles()
    {
        return roles;
    }

    public void setRoles(List<SysRole> roles)
    {
        this.roles = roles;
    }

    public Long[] getRoleIds()
    {
        return roleIds;
    }

    public void setRoleIds(Long[] roleIds)
    {
        this.roleIds = roleIds;
    }

    public Long getRoleId()
    {
        return roleId;
    }

    public void setRoleId(Long roleId)
    {
        this.roleId = roleId;
    }

    private static boolean StringUtilsIsEmpty(String str)
    {
        return str == null || str.isEmpty();
    }

    @Override
    public String toString() {
        return new ToStringBuilder(this,ToStringStyle.MULTI_LINE_STYLE)
            .append("userId", getUserId())
            .append("account", getAccount())
            .append("userName", getUserName())
            .append("nickName", getNickName())
            .append("email", getEmail())
            .append("phonenumber", getPhonenumber())
            .append("sex", getSex())
            .append("age", getAge())
            .append("address", getAddress())
            .append("employeeNo", getEmployeeNo())
            .append("idCard", getIdCard())
            .append("education", getEducation())
            .append("avatar", getAvatar())
            .append("fullAvatar", getFullAvatar())
            .append("password", getPassword())
            .append("status", getStatus())
            .append("isDel", getIsDel())
            .append("createBy", getCreateBy())
            .append("createTime", getCreateTime())
            .append("updateBy", getUpdateBy())
            .append("updateTime", getUpdateTime())
            .append("roleId", getRoleId())
            .append("roleName", getRoleName())
            .toString();
    }
}
