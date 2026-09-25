package com.erp.common.constant;

/**
 * 缓存的key 常量
 *
 * Redis 仅保留三类前缀：
 * <ul>
 *   <li>accessToken: — 访问令牌会话</li>
 *   <li>refreshToken: — 刷新令牌会话</li>
 *   <li>apiCache: — 其他接口缓存（验证码/防重/限流/密码错误等）</li>
 * </ul>
 *
 * @author finance
 */
public class CacheConstants
{
    /**
     * accessToken 会话：accessToken:{uuid} -> LoginUser
     */
    public static final String ACCESS_TOKEN_KEY = "accessToken:";

    /**
     * @deprecated 兼容旧命名，等同 {@link #ACCESS_TOKEN_KEY}
     */
    @Deprecated
    public static final String LOGIN_TOKEN_KEY = ACCESS_TOKEN_KEY;

    /**
     * refreshToken 会话：refreshToken:{uuid} -> {account, accessTokenId}
     * （uuid 与 accessToken 相同，由 JWT claims.login_user_key 承载）
     */
    public static final String REFRESH_TOKEN_KEY = "refreshToken:";

    /**
     * 接口缓存统一前缀
     */
    public static final String API_CACHE_KEY = "apiCache:";

    /**
     * 验证码：apiCache:captcha:{uuid}
     */
    public static final String CAPTCHA_CODE_KEY = API_CACHE_KEY + "captcha:";

    /**
     * 防重提交：apiCache:repeatSubmit:{url}{token}
     */
    public static final String REPEAT_SUBMIT_KEY = API_CACHE_KEY + "repeatSubmit:";

    /**
     * 限流：apiCache:rateLimit:...
     */
    public static final String RATE_LIMIT_KEY = API_CACHE_KEY + "rateLimit:";

    /**
     * 密码错误次数：apiCache:pwdErrCnt:{username}
     */
    public static final String PWD_ERR_CNT_KEY = API_CACHE_KEY + "pwdErrCnt:";
}
