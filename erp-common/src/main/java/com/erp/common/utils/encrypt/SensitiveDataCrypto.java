package com.erp.common.utils.encrypt;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.util.Base64;
import javax.crypto.Cipher;
import javax.crypto.spec.IvParameterSpec;
import javax.crypto.spec.SecretKeySpec;

import com.erp.common.enums.DesensitizedType;
import com.erp.common.utils.StringUtils;

/**
 * 敏感信息加解密与脱敏（每次加密生成独立密钥，脱密需传入该密钥）
 * <p>
 * 密文格式：Base64(IV) + ":" + Base64(ciphertext)，AES-128-CBC
 *
 * @author finance
 */
public final class SensitiveDataCrypto {
    private static final String TRANSFORMATION = "AES/CBC/PKCS5Padding";
    private static final int KEY_LEN = 16;
    private static final int IV_LEN = 16;
    private static final SecureRandom RANDOM = new SecureRandom();

    private SensitiveDataCrypto() {
    }

    /**
     * 生成 Base64 密钥（可用于同列表多字段共用一把解密密钥）
     */
    public static String generateSecretKey() {
        byte[] keyBytes = new byte[KEY_LEN];
        RANDOM.nextBytes(keyBytes);
        return Base64.getEncoder().encodeToString(keyBytes);
    }

    /**
     * 加密明文，同时生成脱敏展示值（每次随机密钥）
     *
     * @param plainText 明文
     * @param type      脱敏类型（可为 null，则 maskedText 为空串）
     */
    public static SensitiveCryptoResult encrypt(String plainText, DesensitizedType type) {
        if (StringUtils.isEmpty(plainText)) {
            return new SensitiveCryptoResult(plainText, null, plainText);
        }
        return encryptWithKey(plainText, generateSecretKey(), type);
    }

    /**
     * 使用指定密钥加密明文，同时生成脱敏展示值
     */
    public static SensitiveCryptoResult encryptWithKey(String plainText, String secretKey, DesensitizedType type) {
        if (StringUtils.isEmpty(plainText)) {
            return new SensitiveCryptoResult(plainText, secretKey, plainText);
        }
        if (StringUtils.isEmpty(secretKey)) {
            throw new IllegalArgumentException("加密密钥不能为空");
        }
        try {
            byte[] keyBytes = Base64.getDecoder().decode(secretKey);
            byte[] ivBytes = new byte[IV_LEN];
            RANDOM.nextBytes(ivBytes);

            Cipher cipher = Cipher.getInstance(TRANSFORMATION);
            cipher.init(Cipher.ENCRYPT_MODE, new SecretKeySpec(keyBytes, "AES"), new IvParameterSpec(ivBytes));
            byte[] encrypted = cipher.doFinal(plainText.getBytes(StandardCharsets.UTF_8));

            String cipherText = Base64.getEncoder().encodeToString(ivBytes) + ":"
                    + Base64.getEncoder().encodeToString(encrypted);
            String maskedText = type != null ? desensitize(plainText, type) : StringUtils.EMPTY;
            return new SensitiveCryptoResult(cipherText, secretKey, maskedText);
        } catch (IllegalArgumentException e) {
            throw e;
        } catch (Exception e) {
            throw new IllegalStateException("敏感信息加密失败", e);
        }
    }

    /**
     * 使用密钥解密密文
     */
    public static String decrypt(String cipherText, String secretKey) {
        if (StringUtils.isEmpty(cipherText)) {
            return cipherText;
        }
        if (StringUtils.isEmpty(secretKey)) {
            throw new IllegalArgumentException("解密密钥不能为空");
        }
        try {
            String[] parts = cipherText.split(":", 2);
            if (parts.length != 2) {
                throw new IllegalArgumentException("密文格式无效");
            }
            byte[] ivBytes = Base64.getDecoder().decode(parts[0]);
            byte[] encrypted = Base64.getDecoder().decode(parts[1]);
            byte[] keyBytes = Base64.getDecoder().decode(secretKey);

            Cipher cipher = Cipher.getInstance(TRANSFORMATION);
            cipher.init(Cipher.DECRYPT_MODE, new SecretKeySpec(keyBytes, "AES"), new IvParameterSpec(ivBytes));
            byte[] plain = cipher.doFinal(encrypted);
            return new String(plain, StandardCharsets.UTF_8);
        } catch (IllegalArgumentException e) {
            throw e;
        } catch (Exception e) {
            throw new IllegalStateException("敏感信息解密失败，请检查密钥是否正确", e);
        }
    }

    /**
     * 按类型脱敏
     */
    public static String desensitize(String value, DesensitizedType type) {
        if (StringUtils.isEmpty(value) || type == null) {
            return value;
        }
        return type.desensitizer().apply(value);
    }

    /**
     * 手机号脱敏
     */
    public static String desensitizePhone(String phone) {
        return desensitize(phone, DesensitizedType.PHONE);
    }

    /**
     * 身份证号脱敏
     */
    public static String desensitizeIdCard(String idCard) {
        return desensitize(idCard, DesensitizedType.ID_CARD);
    }

    /**
     * 是否已是脱敏值（含 *）
     */
    public static boolean isMasked(String value) {
        return StringUtils.isNotEmpty(value) && value.indexOf('*') >= 0;
    }

    /**
     * 明文哈希（用于唯一性校验，不可逆）
     */
    public static String hash(String plainText) {
        if (StringUtils.isEmpty(plainText)) {
            return plainText;
        }
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(plainText.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder(hash.length * 2);
            for (byte b : hash) {
                sb.append(String.format("%02x", b));
            }
            return sb.toString();
        } catch (Exception e) {
            throw new IllegalStateException("敏感信息哈希失败", e);
        }
    }
}
