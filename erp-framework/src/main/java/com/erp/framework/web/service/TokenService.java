package com.erp.framework.web.service;

import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.TimeUnit;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import com.erp.common.constant.CacheConstants;
import com.erp.common.constant.Constants;
import com.erp.common.core.domain.entity.SysUser;
import com.erp.common.core.domain.model.LoginUser;
import com.erp.common.core.redis.RedisCache;
import com.erp.common.core.service.ITokenService;
import com.erp.common.enums.UserStatus;
import com.erp.common.exception.ServiceException;
import com.erp.common.utils.ServletUtils;
import com.erp.common.utils.StringUtils;
import com.erp.common.utils.http.UserAgentUtils;
import com.erp.common.utils.ip.AddressUtils;
import com.erp.common.utils.ip.IpUtils;
import com.erp.common.utils.uuid.IdUtils;
import com.erp.system.service.ISysUserService;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;

/**
 * token验证处理
 * 
 * @author finance
 */
@Component
public class TokenService implements ITokenService
{
    private static final Logger log = LoggerFactory.getLogger(TokenService.class);

    // 令牌自定义标识
    @Value("${token.header}")
    private String header;

    // 令牌秘钥
    @Value("${token.secret}")
    private String secret;

    // 令牌有效期（秒）
    @Value("${token.expireTime}")
    private int expireTime;

    /** refreshToken 有效期（天） */
    @Value("${token.refreshExpireDays:1}")
    private int refreshExpireDays;

    protected static final long MILLIS_SECOND = 1000;

    /** 剩余不足该时长时自动续期 accessToken 缓存 */
    private static final long REFRESH_THRESHOLD_MILLIS = 5 * MILLIS_SECOND;

    @Autowired
    private RedisCache redisCache;

    @Autowired
    private ISysUserService userService;

    @Autowired
    private UserDetailsServiceImpl userDetailsService;

    /**
     * 获取用户身份信息
     * 
     * @return 用户信息
     */
    public LoginUser getLoginUser(HttpServletRequest request)
    {
        // 获取请求携带的令牌
        String token = getToken(request);
        if (StringUtils.isNotEmpty(token))
        {
            try
            {
                Claims claims = parseToken(token);
                // 解析对应的权限以及用户信息
                String uuid = (String) claims.get(Constants.LOGIN_USER_KEY);
                String userKey = getTokenKey(uuid);
                LoginUser user = redisCache.getCacheObject(userKey);
                return user;
            }
            catch (Exception e)
            {
                log.error("获取用户信息异常'{}'", e.getMessage());
            }
        }
        return null;
    }

    /**
     * 设置用户身份信息
     */
    public void setLoginUser(LoginUser loginUser)
    {
        if (StringUtils.isNotNull(loginUser) && StringUtils.isNotEmpty(loginUser.getToken()))
        {
            refreshToken(loginUser);
        }
    }

    /**
     * 删除用户身份信息
     */
    public void delLoginUser(String token)
    {
        if (StringUtils.isNotEmpty(token))
        {
            String userKey = getTokenKey(token);
            redisCache.deleteObject(userKey);
        }
    }

    /**
     * 创建令牌
     * 
     * @param loginUser 用户信息
     * @return 令牌
     */
    public String createToken(LoginUser loginUser)
    {
        String token = IdUtils.fastUUID();
        loginUser.setToken(token);
        setUserAgent(loginUser);
        refreshToken(loginUser);

        Map<String, Object> claims = new HashMap<>();
        claims.put(Constants.LOGIN_USER_KEY, token);
        claims.put(Constants.JWT_USERNAME, loginUser.getUsername());
        return createToken(claims);
    }

    /**
     * 验证令牌有效期，剩余不足阈值时自动刷新缓存
     * 
     * @param loginUser 登录信息
     * @return 令牌
     */
    public void verifyToken(LoginUser loginUser)
    {
        long expireTime = loginUser.getExpireTime();
        long currentTime = System.currentTimeMillis();
        if (expireTime - currentTime <= REFRESH_THRESHOLD_MILLIS)
        {
            refreshToken(loginUser);
        }
    }

    /**
     * 刷新令牌有效期
     * 
     * @param loginUser 登录信息
     */
    public void refreshToken(LoginUser loginUser)
    {
        loginUser.setLoginTime(System.currentTimeMillis());
        loginUser.setExpireTime(loginUser.getLoginTime() + expireTime * MILLIS_SECOND);
        // 根据uuid将loginUser缓存
        String userKey = getTokenKey(loginUser.getToken());
        redisCache.setCacheObject(userKey, loginUser, expireTime, TimeUnit.SECONDS);
    }

    /**
     * 设置用户代理信息
     * 
     * @param loginUser 登录信息
     */
    public void setUserAgent(LoginUser loginUser)
    {
        String userAgent = ServletUtils.getRequest().getHeader("User-Agent");
        String ip = IpUtils.getIpAddr();
        loginUser.setIpaddr(ip);
        loginUser.setLoginLocation(AddressUtils.getRealAddressByIP(ip));
        loginUser.setBrowser(UserAgentUtils.getBrowser(userAgent));
        loginUser.setOs(UserAgentUtils.getOperatingSystem(userAgent));
    }

    /**
     * 从数据声明生成令牌
     *
     * @param claims 数据声明
     * @return 令牌
     */
    private String createToken(Map<String, Object> claims)
    {
        String token = Jwts.builder()
                .setClaims(claims)
                .signWith(SignatureAlgorithm.HS512, secret).compact();
        return token;
    }

    /**
     * 从令牌中获取数据声明
     *
     * @param token 令牌
     * @return 数据声明
     */
    private Claims parseToken(String token)
    {
        return Jwts.parser()
                .setSigningKey(secret)
                .parseClaimsJws(token)
                .getBody();
    }

    /**
     * 从令牌中获取用户名
     *
     * @param token 令牌
     * @return 用户名
     */
    public String getUsernameFromToken(String token)
    {
        Claims claims = parseToken(token);
        return claims.getSubject();
    }

    /**
     * 获取请求token
     *
     * @param request
     * @return token
     */
    private String getToken(HttpServletRequest request)
    {
        String token = request.getHeader(header);
        if (StringUtils.isNotEmpty(token) && token.startsWith(Constants.TOKEN_PREFIX))
        {
            token = token.replace(Constants.TOKEN_PREFIX, "");
        }
        return token;
    }

    private String getTokenKey(String uuid)
    {
        return CacheConstants.ACCESS_TOKEN_KEY + uuid;
    }

    @Override
    public String createRefreshToken(LoginUser loginUser, HttpServletResponse response)
    {
        String account = loginUser.getUsername();
        // 与 accessToken 相同：先生成 uuid 缓存会话，再签发 JWT
        String uuid = IdUtils.fastUUID();
        int ttlSeconds = refreshExpireDays * 24 * 60 * 60;

        Map<String, String> session = new HashMap<>(2);
        session.put("account", account);
        session.put("accessTokenId", loginUser.getToken());
        redisCache.setCacheObject(CacheConstants.REFRESH_TOKEN_KEY + uuid, session, ttlSeconds, TimeUnit.SECONDS);

        Map<String, Object> claims = new HashMap<>();
        claims.put(Constants.LOGIN_USER_KEY, uuid);
        claims.put(Constants.JWT_USERNAME, account);
        String refreshToken = createToken(claims);

        Cookie cookie = new Cookie("refreshToken", refreshToken);
        cookie.setHttpOnly(true);
        cookie.setPath("/");
        cookie.setMaxAge(ttlSeconds);
        cookie.setSecure(false);
        response.addCookie(cookie);
        return refreshToken;
    }

    @Override
    public String refreshAccessToken(String refreshToken)
    {
        String uuid = parseRefreshTokenUuid(refreshToken);
        if (StringUtils.isEmpty(uuid))
        {
            throw new ServiceException("Refresh token expired", 401);
        }
        String refreshKey = CacheConstants.REFRESH_TOKEN_KEY + uuid;
        Map<String, String> session = redisCache.getCacheObject(refreshKey);
        if (session == null || session.isEmpty())
        {
            throw new ServiceException("Refresh token expired", 401);
        }

        String accessTokenId = session.get("accessTokenId");
        LoginUser loginUser = StringUtils.isNotEmpty(accessTokenId)
                ? redisCache.getCacheObject(getTokenKey(accessTokenId))
                : null;

        if (loginUser != null)
        {
            // access 会话仍在：续期并签发同 uuid 的新 JWT
            refreshToken(loginUser);
            Map<String, Object> claims = new HashMap<>();
            claims.put(Constants.LOGIN_USER_KEY, loginUser.getToken());
            claims.put(Constants.JWT_USERNAME, loginUser.getUsername());
            return createToken(claims);
        }

        // access 已过期：凭 refresh 会话中的 account 重建 LoginUser，签发新 accessToken
        LoginUser rebuilt = rebuildLoginUser(session.get("account"));
        String accessJwt = createToken(rebuilt);
        session.put("accessTokenId", rebuilt.getToken());
        bindRefreshSession(refreshKey, session);
        return accessJwt;
    }

    /**
     * 按账号重建登录用户（不走密码校验，供 refresh 换票）
     */
    private LoginUser rebuildLoginUser(String account)
    {
        if (StringUtils.isEmpty(account))
        {
            throw new ServiceException("Refresh token expired", 401);
        }
        SysUser user = userService.selectUserByUserName(account);
        if (user == null)
        {
            throw new ServiceException("Refresh token expired", 401);
        }
        if (UserStatus.DELETED.getCode().equals(user.getDelFlag()))
        {
            throw new ServiceException("Refresh token expired", 401);
        }
        if (UserStatus.DISABLE.getCode().equals(user.getStatus()))
        {
            throw new ServiceException("账号已停用", 401);
        }
        return (LoginUser) userDetailsService.createLoginUser(user);
    }

    /** 更新 refresh 会话并尽量保留剩余 TTL */
    private void bindRefreshSession(String refreshKey, Map<String, String> session)
    {
        long ttl = redisCache.getExpire(refreshKey);
        int ttlSeconds = ttl > 0 ? (int) ttl : refreshExpireDays * 24 * 60 * 60;
        redisCache.setCacheObject(refreshKey, session, ttlSeconds, TimeUnit.SECONDS);
    }

    @Override
    public void clearRefreshToken(String account, String refreshToken, HttpServletResponse response)
    {
        if (StringUtils.isNotEmpty(refreshToken))
        {
            String uuid = parseRefreshTokenUuid(refreshToken);
            if (StringUtils.isNotEmpty(uuid))
            {
                redisCache.deleteObject(CacheConstants.REFRESH_TOKEN_KEY + uuid);
            }
        }
        Cookie cookie = new Cookie("refreshToken", "");
        cookie.setHttpOnly(true);
        cookie.setPath("/");
        cookie.setMaxAge(0);
        response.addCookie(cookie);
    }

    /**
     * 解析 refreshToken JWT，取出与 accessToken 相同结构的 login_user_key（uuid）
     */
    private String parseRefreshTokenUuid(String refreshToken)
    {
        if (StringUtils.isEmpty(refreshToken))
        {
            return null;
        }
        try
        {
            Claims claims = parseToken(refreshToken);
            return (String) claims.get(Constants.LOGIN_USER_KEY);
        }
        catch (Exception e)
        {
            log.error("解析 refreshToken 异常'{}'", e.getMessage());
            return null;
        }
    }
}
