package com.erp.common.core.redis;

import java.util.concurrent.TimeUnit;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import com.erp.common.constant.CacheConstants;
import com.erp.common.utils.StringUtils;

/**
 * 接口缓存（统一前缀 apiCache:）
 * <p>
 * Key 格式：apiCache:{biz}:{key}
 *
 * @author finance
 */
@Component
public class ApiCache
{
    @Autowired
    private RedisCache redisCache;

    /**
     * 写入接口缓存
     *
     * @param biz 业务分段，如 dict、config、home
     * @param key 业务键
     * @param value 缓存值
     * @param timeout 过期时间
     * @param timeUnit 时间单位
     */
    public <T> void put(String biz, String key, T value, Integer timeout, TimeUnit timeUnit)
    {
        redisCache.setCacheObject(buildKey(biz, key), value, timeout, timeUnit);
    }

    /**
     * 写入接口缓存（不过期，慎用）
     */
    public <T> void put(String biz, String key, T value)
    {
        redisCache.setCacheObject(buildKey(biz, key), value);
    }

    /**
     * 读取接口缓存
     */
    public <T> T get(String biz, String key)
    {
        return redisCache.getCacheObject(buildKey(biz, key));
    }

    /**
     * 是否存在
     */
    public boolean has(String biz, String key)
    {
        return redisCache.hasKey(buildKey(biz, key));
    }

    /**
     * 删除单条
     */
    public boolean evict(String biz, String key)
    {
        return redisCache.deleteObject(buildKey(biz, key));
    }

    /**
     * 按业务分段批量删除：apiCache:{biz}:*
     */
    public void evictBiz(String biz)
    {
        if (StringUtils.isEmpty(biz))
        {
            return;
        }
        redisCache.deleteObject(redisCache.keys(CacheConstants.API_CACHE_KEY + biz + ":*"));
    }

    private String buildKey(String biz, String key)
    {
        String safeBiz = StringUtils.isEmpty(biz) ? "default" : biz;
        String safeKey = StringUtils.isEmpty(key) ? "_" : key;
        return CacheConstants.API_CACHE_KEY + safeBiz + ":" + safeKey;
    }
}
