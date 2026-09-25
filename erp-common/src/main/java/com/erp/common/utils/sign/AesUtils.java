package com.erp.common.utils.sign;

import java.nio.charset.StandardCharsets;
import java.util.Base64;
import javax.crypto.Cipher;
import javax.crypto.spec.IvParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import com.erp.common.utils.StringUtils;

/**
 * AES 加解密（对齐前端 crypto-js / server crypt：AES-128-CBC）
 *
 * @author finance
 */
public class AesUtils
{
    private static final String KEY = "mm7h3ck87ugk9l4a";
    private static final String IV = "jxkvxz97409u3m8c";
    private static final String TRANSFORMATION = "AES/CBC/PKCS5Padding";

    private AesUtils()
    {
    }

    /**
     * 加密为 Base64 密文（对齐前端 crypto-js AES-128-CBC）
     */
    public static String encrypt(String plainText)
    {
        if (StringUtils.isEmpty(plainText))
        {
            return plainText;
        }
        try
        {
            Cipher cipher = Cipher.getInstance(TRANSFORMATION);
            cipher.init(Cipher.ENCRYPT_MODE,
                    new SecretKeySpec(KEY.getBytes(StandardCharsets.UTF_8), "AES"),
                    new IvParameterSpec(IV.getBytes(StandardCharsets.UTF_8)));
            byte[] encrypted = cipher.doFinal(plainText.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(encrypted);
        }
        catch (Exception e)
        {
            throw new IllegalStateException("AES encrypt failed", e);
        }
    }

    /**
     * 解密前端 aesEncrypt 密文（Base64）
     */
    public static String decrypt(String cipherText)
    {
        if (StringUtils.isEmpty(cipherText))
        {
            return cipherText;
        }
        try
        {
            Cipher cipher = Cipher.getInstance(TRANSFORMATION);
            cipher.init(Cipher.DECRYPT_MODE,
                    new SecretKeySpec(KEY.getBytes(StandardCharsets.UTF_8), "AES"),
                    new IvParameterSpec(IV.getBytes(StandardCharsets.UTF_8)));
            byte[] plain = cipher.doFinal(Base64.getDecoder().decode(cipherText));
            return new String(plain, StandardCharsets.UTF_8);
        }
        catch (Exception e)
        {
            // 兼容明文直传（本地调试）
            return cipherText;
        }
    }
}
