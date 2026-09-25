package com.erp.common.utils.log;

import java.lang.reflect.Field;
import java.lang.reflect.Modifier;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.Collections;
import java.util.Date;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import com.alibaba.fastjson2.JSON;
import com.alibaba.fastjson2.JSONObject;
import com.erp.common.annotation.Excel;
import com.erp.common.utils.StringUtils;

/**
 * 操作日志字段级 diff
 */
public final class OperDiffUtils
{
    private static final Set<String> IGNORE_FIELDS = new HashSet<>(Arrays.asList(
            "serialVersionUID", "createBy", "createTime", "updateBy", "updateTime", "remark", "params",
            "beginTime", "endTime", "searchValue", "roles", "children", "businessTypes"));

    /** 参与变更检测，落库时脱敏，不写明文 */
    private static final Set<String> SENSITIVE_FIELDS = new HashSet<>(Arrays.asList(
            "password", "oldPassword", "newPassword", "confirmPassword"));

    private static final String MASK = "******";

    private OperDiffUtils()
    {
    }

    public static List<OperChangeItem> diff(Object before, Object after, String[] excludeFields)
    {
        return diff(before, after, null, excludeFields);
    }

    /**
     * @param afterPresentKeys 请求体实际出现的字段（UPDATE 时传入原始 JSON），避免未传字段被当成改成 null
     */
    public static List<OperChangeItem> diff(Object before, Object after, Map<String, ?> afterPresentKeys,
            String[] excludeFields)
    {
        Set<String> excludes = new HashSet<>(IGNORE_FIELDS);
        if (excludeFields != null)
        {
            Collections.addAll(excludes, excludeFields);
        }
        Map<String, Object> beforeMap = toValueMap(before, excludes);
        Map<String, Object> afterMap;
        Set<String> keys = new HashSet<>();

        if (after == null && before != null)
        {
            // DELETE：对比旧实体全部字段 → 空
            afterMap = Collections.emptyMap();
            keys.addAll(beforeMap.keySet());
        }
        else if (afterPresentKeys != null && !afterPresentKeys.isEmpty())
        {
            // UPDATE/INSERT：只对比请求 JSON 里真正出现的 key
            afterMap = toValueMap(afterPresentKeys, excludes);
            keys.addAll(afterMap.keySet());
        }
        else
        {
            afterMap = toValueMap(after, excludes);
            if (before == null)
            {
                // INSERT 无原始 JSON 时，忽略空 after
                keys.addAll(afterMap.keySet());
            }
            else
            {
                // UPDATE 回退：未传字段在 Bean 上多为 null，不参与对比
                for (Map.Entry<String, Object> entry : afterMap.entrySet())
                {
                    if (entry.getValue() != null)
                    {
                        keys.add(entry.getKey());
                    }
                }
            }
        }

        List<OperChangeItem> items = new ArrayList<>();
        for (String key : keys)
        {
            Object bv = beforeMap.get(key);
            Object av = afterMap.get(key);
            if (isSame(bv, av))
            {
                continue;
            }
            // INSERT：before 全空时只记有值的 after
            if (before == null && isEmptyValue(av))
            {
                continue;
            }
            String label = resolveLabel(before != null ? before.getClass() : (after != null ? after.getClass() : null), key);
            if (SENSITIVE_FIELDS.contains(key))
            {
                // 请求未带新密码时视为未改，避免编辑用户时空密码误报变更
                if (isEmptyValue(av))
                {
                    continue;
                }
                items.add(new OperChangeItem(key, label, isEmptyValue(bv) ? null : MASK, MASK));
            }
            else
            {
                items.add(new OperChangeItem(key, label, normalizeDisplay(bv), normalizeDisplay(av)));
            }
        }
        return items;
    }

    /** 是否存在有效字段变更 */
    public static boolean hasChanges(List<OperChangeItem> items)
    {
        return items != null && !items.isEmpty();
    }

    public static String toJson(List<OperChangeItem> items)
    {
        if (items == null || items.isEmpty())
        {
            return null;
        }
        return JSON.toJSONString(items);
    }

    public static Object extractBizArg(Object[] args)
    {
        if (args == null)
        {
            return null;
        }
        for (Object arg : args)
        {
            if (arg == null || isSimpleType(arg.getClass()) || arg instanceof Map
                    || arg instanceof Collection || arg.getClass().isArray())
            {
                continue;
            }
            String name = arg.getClass().getName();
            if (name.startsWith("jakarta.") || name.startsWith("org.springframework."))
            {
                continue;
            }
            return arg;
        }
        // 退化为 Map 参数
        for (Object arg : args)
        {
            if (arg instanceof Map)
            {
                return arg;
            }
        }
        return null;
    }

    private static Map<String, Object> toValueMap(Object source, Set<String> excludes)
    {
        Map<String, Object> map = new LinkedHashMap<>();
        if (source == null)
        {
            return map;
        }
        if (source instanceof Map)
        {
            ((Map<?, ?>) source).forEach((k, v) -> {
                if (k != null)
                {
                    String key = String.valueOf(k);
                    if (!excludes.contains(key))
                    {
                        map.put(key, v);
                    }
                }
            });
            return map;
        }
        if (source instanceof String)
        {
            String text = ((String) source).trim();
            if (text.startsWith("{"))
            {
                try
                {
                    JSONObject obj = JSON.parseObject(text);
                    obj.forEach((k, v) -> {
                        if (!excludes.contains(k))
                        {
                            map.put(k, v);
                        }
                    });
                    return map;
                }
                catch (Exception ignored)
                {
                }
            }
        }
        Class<?> clazz = source.getClass();
        while (clazz != null && clazz != Object.class)
        {
            for (Field field : clazz.getDeclaredFields())
            {
                if (Modifier.isStatic(field.getModifiers()) || excludes.contains(field.getName()))
                {
                    continue;
                }
                field.setAccessible(true);
                try
                {
                    map.putIfAbsent(field.getName(), field.get(source));
                }
                catch (IllegalAccessException ignored)
                {
                }
            }
            clazz = clazz.getSuperclass();
        }
        return map;
    }

    private static String resolveLabel(Class<?> clazz, String fieldName)
    {
        if (clazz == null)
        {
            return fieldName;
        }
        Class<?> current = clazz;
        while (current != null && current != Object.class)
        {
            try
            {
                Field field = current.getDeclaredField(fieldName);
                Excel excel = field.getAnnotation(Excel.class);
                if (excel != null && StringUtils.isNotEmpty(excel.name()))
                {
                    return excel.name();
                }
            }
            catch (NoSuchFieldException ignored)
            {
            }
            current = current.getSuperclass();
        }
        return fieldName;
    }

    private static boolean isSame(Object a, Object b)
    {
        if (isEmptyValue(a) && isEmptyValue(b))
        {
            return true;
        }
        if (a instanceof Date && b instanceof Date)
        {
            return ((Date) a).getTime() == ((Date) b).getTime();
        }
        if (a != null && b != null && isSimpleType(a.getClass()) && isSimpleType(b.getClass()))
        {
            return Objects.equals(String.valueOf(a), String.valueOf(b));
        }
        if (a instanceof Collection || b instanceof Collection || (a != null && a.getClass().isArray())
                || (b != null && b.getClass().isArray()))
        {
            return Objects.equals(JSON.toJSONString(a), JSON.toJSONString(b));
        }
        return Objects.equals(a, b);
    }

    private static boolean isEmptyValue(Object value)
    {
        if (value == null)
        {
            return true;
        }
        if (value instanceof String)
        {
            return ((String) value).isEmpty();
        }
        if (value instanceof Collection)
        {
            return ((Collection<?>) value).isEmpty();
        }
        if (value.getClass().isArray())
        {
            return ((Object[]) value).length == 0;
        }
        return false;
    }

    private static Object normalizeDisplay(Object value)
    {
        if (value == null)
        {
            return null;
        }
        if (value instanceof Date || value instanceof Collection || value.getClass().isArray() || value instanceof Map)
        {
            return JSON.toJSONString(value);
        }
        return value;
    }

    private static boolean isSimpleType(Class<?> clazz)
    {
        return clazz.isPrimitive() || Number.class.isAssignableFrom(clazz) || CharSequence.class.isAssignableFrom(clazz)
                || Boolean.class.isAssignableFrom(clazz) || Date.class.isAssignableFrom(clazz)
                || clazz.isEnum() || Character.class == clazz;
    }
}
