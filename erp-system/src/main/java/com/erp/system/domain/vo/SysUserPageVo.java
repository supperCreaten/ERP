package com.erp.system.domain.vo;

import com.erp.common.core.domain.entity.SysUser;
import com.erp.common.utils.StringUtils;
import com.erp.common.utils.bean.BeanUtils;
import com.erp.common.utils.encrypt.SensitiveDataCrypto;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

/**
 * 用户分页列表出参：手机号/身份证脱敏，密文与密钥取自数据库字段
 *
 * @author finance
 */
@JsonIgnoreProperties({
    "admin",
    "delFlag",
    "isDel",
    "loginDate",
    "loginIp",
    "pwdUpdateDate",
    "account",
    "avatar",
    "fullAvatar",
    "password"
})
public class SysUserPageVo extends SysUser
{
    private static final long serialVersionUID = 1L;

    public static SysUserPageVo from(SysUser user)
    {
        SysUserPageVo vo = new SysUserPageVo();
        if (user == null)
        {
            return vo;
        }
        BeanUtils.copyBeanProp(vo, user);

        if (StringUtils.isNotEmpty(user.getPhonenumber()))
        {
            vo.setPhonenumber(SensitiveDataCrypto.desensitizePhone(user.getPhonenumber()));
        }
        if (StringUtils.isNotEmpty(user.getIdCard()))
        {
            vo.setIdCard(SensitiveDataCrypto.desensitizeIdCard(user.getIdCard()));
        }
        return vo;
    }
}
