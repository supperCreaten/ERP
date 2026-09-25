package com.erp.framework.aspectj;

import java.lang.reflect.Method;
import java.util.Collection;
import java.util.List;
import java.util.Map;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.apache.commons.lang3.ArrayUtils;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.AfterReturning;
import org.aspectj.lang.annotation.AfterThrowing;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.aspectj.lang.reflect.MethodSignature;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.DefaultParameterNameDiscoverer;
import org.springframework.core.NamedThreadLocal;
import org.springframework.core.ParameterNameDiscoverer;
import org.springframework.expression.EvaluationContext;
import org.springframework.expression.Expression;
import org.springframework.expression.ExpressionParser;
import org.springframework.expression.spel.standard.SpelExpressionParser;
import org.springframework.expression.spel.support.StandardEvaluationContext;
import org.springframework.stereotype.Component;
import org.springframework.validation.BindingResult;
import org.springframework.web.multipart.MultipartFile;
import com.alibaba.fastjson2.JSON;
import com.alibaba.fastjson2.JSONObject;
import com.erp.common.annotation.Log;
import com.erp.common.enums.BusinessStatus;
import com.erp.common.enums.BusinessType;
import com.erp.common.enums.HttpMethod;
import com.erp.common.filter.PropertyPreExcludeFilter;
import com.erp.common.utils.ExceptionUtil;
import com.erp.common.utils.SecurityUtils;
import com.erp.common.utils.ServletUtils;
import com.erp.common.utils.StringUtils;
import com.erp.common.utils.http.HttpHelper;
import com.erp.common.utils.ip.AddressUtils;
import com.erp.common.utils.ip.IpUtils;
import com.erp.common.utils.log.OperChangeItem;
import com.erp.common.utils.log.OperDiffUtils;
import com.erp.framework.manager.AsyncManager;
import com.erp.framework.manager.factory.AsyncFactory;
import com.erp.system.domain.SysOperLog;

/**
 * 操作日志记录处理（含字段级修改项）
 *
 * @author finance
 */
@Aspect
@Component
public class LogAspect {
    private static final Logger log = LoggerFactory.getLogger(LogAspect.class);

    public static final String[] EXCLUDE_PROPERTIES = {"password", "oldPassword", "newPassword", "confirmPassword"};

    private static final ThreadLocal<Long> TIME_THREADLOCAL = new NamedThreadLocal<>("Cost Time");

    private static final ThreadLocal<Object> BEFORE_THREADLOCAL = new NamedThreadLocal<>("Oper Before Snapshot");

    private static final int PARAM_MAX_LENGTH = 2000;

    private static final ExpressionParser SPEL_PARSER = new SpelExpressionParser();

    private static final ParameterNameDiscoverer PARAM_NAME_DISCOVERER = new DefaultParameterNameDiscoverer();

    @Autowired
    private OperBizDataLoader operBizDataLoader;

    @Before(value = "@annotation(controllerLog)")
    public void doBefore(JoinPoint joinPoint, Log controllerLog) {
        TIME_THREADLOCAL.set(System.currentTimeMillis());
        BEFORE_THREADLOCAL.remove();
        try {
            BusinessType type = controllerLog.businessType();
            if (StringUtils.isNotEmpty(controllerLog.bizId())
                    && (type == BusinessType.UPDATE || type == BusinessType.DELETE || type == BusinessType.GRANT)) {
                Object bizId = parseBizId(joinPoint, controllerLog.bizId());
                Object before = operBizDataLoader.load(controllerLog.title(), bizId);
                if (before != null) {
                    BEFORE_THREADLOCAL.set(before);
                }
            }
        } catch (Exception e) {
            log.warn("加载操作日志旧数据失败: {}", e.getMessage());
        }
    }

    @AfterReturning(pointcut = "@annotation(controllerLog)", returning = "jsonResult")
    public void doAfterReturning(JoinPoint joinPoint, Log controllerLog, Object jsonResult) {
        handleLog(joinPoint, controllerLog, null, jsonResult);
    }

    @AfterThrowing(value = "@annotation(controllerLog)", throwing = "e")
    public void doAfterThrowing(JoinPoint joinPoint, Log controllerLog, Exception e) {
        handleLog(joinPoint, controllerLog, e, null);
    }

    protected void handleLog(final JoinPoint joinPoint, Log controllerLog, final Exception e, Object jsonResult) {
        try {
            String operName = "";
            try {
                // 操作人记 sys_user.user_name（显示名），不用登录账号
                operName = SecurityUtils.getNickName();
            } catch (Exception ignored) {
            }

            String ip = IpUtils.getIpAddr();
            String operUrl = StringUtils.substring(ServletUtils.getRequest().getRequestURI(), 0, 255);
            String className = joinPoint.getTarget().getClass().getName();
            String methodName = joinPoint.getSignature().getName();
            String method = className + "." + methodName + "()";
            String requestMethod = ServletUtils.getRequest().getMethod();
            String userAgent = StringUtils.substring(ServletUtils.getRequest().getHeader("User-Agent"), 0, 500);
            Long start = TIME_THREADLOCAL.get();
            long costTime = start == null ? 0L : System.currentTimeMillis() - start;
            int status = e == null ? BusinessStatus.SUCCESS.ordinal() : BusinessStatus.FAIL.ordinal();
            String errorMsg = e == null ? "" : StringUtils.substring(ExceptionUtil.getExceptionMessage(e), 0, 2000);

            String operParam = "";
            if (controllerLog.isSaveRequestData()) {
                operParam = getRequestValue(joinPoint, requestMethod, controllerLog.excludeParamNames());
            }
            String jsonResultStr = "";
            if (controllerLog.isSaveResponseData() && StringUtils.isNotNull(jsonResult)) {
                jsonResultStr = StringUtils.substring(JSON.toJSONString(jsonResult), 0, PARAM_MAX_LENGTH);
            }

            Object before = BEFORE_THREADLOCAL.get();
            BusinessType businessType = controllerLog.businessType();
            Object after = resolveAfter(joinPoint, businessType, before);
            // 用原始请求 JSON 的 key 做 after，避免未传字段（Bean 上为 null）被当成修改
            JSONObject requestJson = readRequestBodyJson();
            List<OperChangeItem> changeItems = OperDiffUtils.diff(before, after, requestJson, controllerLog.excludeFields());
            // 修改/授权：前后无字段变化则不记日志（失败操作仍记录）
            if (e == null
                    && (businessType == BusinessType.UPDATE || businessType == BusinessType.GRANT)
                    && !OperDiffUtils.hasChanges(changeItems)) {
                return;
            }
            String changeDiff = OperDiffUtils.toJson(changeItems);

            SysOperLog operLog = new SysOperLog();
            operLog.setTitle(controllerLog.title());
            operLog.setBusinessType(controllerLog.businessType().ordinal());
            operLog.setMethod(method);
            operLog.setRequestMethod(requestMethod);
            operLog.setOperatorType(controllerLog.operatorType().ordinal());
            operLog.setOperName(operName);
            operLog.setOperUrl(operUrl);
            operLog.setOperIp(ip);
            operLog.setOperLocation(AddressUtils.getRealAddressByIP(ip));
            operLog.setOperParam(operParam);
            operLog.setJsonResult(jsonResultStr);
            operLog.setChangeDiff(changeDiff);
            operLog.setStatus(status);
            operLog.setErrorMsg(errorMsg);
            operLog.setCostTime(costTime);
            operLog.setUserAgent(userAgent);

            AsyncManager.me().execute(AsyncFactory.recordOper(operLog));
        } catch (Exception exp) {
            log.error("记录操作日志异常: {}", exp.getMessage(), exp);
        } finally {
            TIME_THREADLOCAL.remove();
            BEFORE_THREADLOCAL.remove();
        }
    }

    private Object resolveAfter(JoinPoint joinPoint, BusinessType type, Object before) {
        if (type == BusinessType.DELETE || type == BusinessType.CLEAN) {
            return null;
        }
        Object bizArg = OperDiffUtils.extractBizArg(joinPoint.getArgs());
        if (bizArg != null) {
            return bizArg;
        }
        JSONObject body = readRequestBodyJson();
        if (body != null) {
            return body;
        }
        return before;
    }

    /**
     * 读取原始请求 JSON（仅含客户端实际提交的字段）
     */
    private JSONObject readRequestBodyJson() {
        try {
            String body = HttpHelper.getBodyString(ServletUtils.getRequest());
            if (StringUtils.isNotEmpty(body)) {
                String text = body.trim();
                if (text.startsWith("{")) {
                    return JSON.parseObject(text);
                }
            }
        } catch (Exception ignored) {
        }
        return null;
    }

    private Object parseBizId(JoinPoint joinPoint, String spel) {
        MethodSignature signature = (MethodSignature) joinPoint.getSignature();
        Method method = signature.getMethod();
        EvaluationContext context = new StandardEvaluationContext();
        String[] paramNames = PARAM_NAME_DISCOVERER.getParameterNames(method);
        Object[] args = joinPoint.getArgs();
        if (paramNames != null) {
            for (int i = 0; i < paramNames.length; i++) {
                context.setVariable(paramNames[i], args[i]);
            }
        }
        // 兼容 #p0 / #a0
        for (int i = 0; i < args.length; i++) {
            context.setVariable("p" + i, args[i]);
            context.setVariable("a" + i, args[i]);
        }
        try {
            context.setVariable("loginUserId", SecurityUtils.getUserId());
        } catch (Exception ignored) {
        }
        Expression expression = SPEL_PARSER.parseExpression(spel);
        return expression.getValue(context);
    }

    private String getRequestValue(JoinPoint joinPoint, String requestMethod, String[] excludeParamNames) {
        Map<?, ?> paramsMap = ServletUtils.getParamMap(ServletUtils.getRequest());
        if (StringUtils.isEmpty(paramsMap) && StringUtils.equalsAny(requestMethod, HttpMethod.PUT.name(), HttpMethod.POST.name(),
                HttpMethod.DELETE.name())) {
            return argsArrayToString(joinPoint.getArgs(), excludeParamNames);
        }
        return StringUtils.substring(JSON.toJSONString(paramsMap, excludePropertyPreFilter(excludeParamNames)), 0, PARAM_MAX_LENGTH);
    }

    private String argsArrayToString(Object[] paramsArray, String[] excludeParamNames) {
        StringBuilder params = new StringBuilder();
        if (paramsArray != null && paramsArray.length > 0) {
            for (Object o : paramsArray) {
                if (StringUtils.isNotNull(o) && !isFilterObject(o)) {
                    try {
                        String jsonObj = JSON.toJSONString(o, excludePropertyPreFilter(excludeParamNames));
                        params.append(jsonObj).append(" ");
                        if (params.length() >= PARAM_MAX_LENGTH) {
                            return StringUtils.substring(params.toString(), 0, PARAM_MAX_LENGTH);
                        }
                    } catch (Exception e) {
                        log.error("请求参数拼装异常 msg:{}, 参数:{}", e.getMessage(), paramsArray, e);
                    }
                }
            }
        }
        return params.toString();
    }

    public PropertyPreExcludeFilter excludePropertyPreFilter(String[] excludeParamNames) {
        return new PropertyPreExcludeFilter().addExcludes(ArrayUtils.addAll(EXCLUDE_PROPERTIES, excludeParamNames));
    }

    @SuppressWarnings("rawtypes")
    public boolean isFilterObject(final Object o) {
        Class<?> clazz = o.getClass();
        if (clazz.isArray()) {
            return clazz.getComponentType().isAssignableFrom(MultipartFile.class);
        } else if (Collection.class.isAssignableFrom(clazz)) {
            Collection collection = (Collection) o;
            for (Object value : collection) {
                return value instanceof MultipartFile;
            }
        } else if (Map.class.isAssignableFrom(clazz)) {
            Map map = (Map) o;
            for (Object value : map.entrySet()) {
                Map.Entry entry = (Map.Entry) value;
                return entry.getValue() instanceof MultipartFile;
            }
        }
        return o instanceof MultipartFile || o instanceof HttpServletRequest || o instanceof HttpServletResponse
                || o instanceof BindingResult;
    }
}
