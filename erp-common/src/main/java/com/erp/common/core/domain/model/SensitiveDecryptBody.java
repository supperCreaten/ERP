package com.erp.common.core.domain.model;

/**
 * 敏感信息解密请求体
 *
 * @author finance
 */
public class SensitiveDecryptBody
{
    /** 密文（Base64(IV):Base64(ciphertext)） */
    private String cipherText;

    /** 列表下发的解密密钥 */
    private String secretKey;

    public String getCipherText()
    {
        return cipherText;
    }

    public void setCipherText(String cipherText)
    {
        this.cipherText = cipherText;
    }

    public String getSecretKey()
    {
        return secretKey;
    }

    public void setSecretKey(String secretKey)
    {
        this.secretKey = secretKey;
    }
}
