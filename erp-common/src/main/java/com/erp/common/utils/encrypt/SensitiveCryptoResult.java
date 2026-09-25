package com.erp.common.utils.encrypt;

/**
 * 敏感信息加密结果：密文 + 解密密钥 + 脱敏展示值
 *
 * @author finance
 */
public class SensitiveCryptoResult {
    /**
     * 密文（含 IV）
     */
    private final String cipherText;

    /**
     * 解密密钥（Base64）
     */
    private final String secretKey;

    /**
     * 脱敏后的展示值
     */
    private final String maskedText;

    public SensitiveCryptoResult(String cipherText, String secretKey, String maskedText) {
        this.cipherText = cipherText;
        this.secretKey = secretKey;
        this.maskedText = maskedText;
    }

    public String getCipherText() {
        return cipherText;
    }

    public String getSecretKey() {
        return secretKey;
    }

    public String getMaskedText() {
        return maskedText;
    }
}
