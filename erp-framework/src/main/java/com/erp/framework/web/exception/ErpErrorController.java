package com.erp.framework.web.exception;

import jakarta.servlet.RequestDispatcher;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.boot.webmvc.error.ErrorController;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.erp.common.constant.HttpStatus;
import com.erp.common.core.domain.AjaxResult;
import com.erp.common.utils.StringUtils;

/**
 * 覆盖 Spring Boot 默认 /error 响应，统一为 AjaxResult（code/msg），
 * 避免返回 {"status":404,"error":"Not Found",...} 这种结构。
 *
 * @author finance
 */
@RestController
@RequestMapping("${server.error.path:${error.path:/error}}")
public class ErpErrorController implements ErrorController
{
    @RequestMapping
    public AjaxResult error(HttpServletRequest request)
    {
        Integer status = (Integer) request.getAttribute(RequestDispatcher.ERROR_STATUS_CODE);
        String uri = (String) request.getAttribute(RequestDispatcher.ERROR_REQUEST_URI);
        int code = status != null ? status.intValue() : HttpStatus.ERROR;

        String msg;
        if (code == HttpStatus.NOT_FOUND)
        {
            msg = StringUtils.format("请求访问：{}，接口不存在", StringUtils.nvl(uri, ""));
        }
        else
        {
            Object message = request.getAttribute(RequestDispatcher.ERROR_MESSAGE);
            msg = message != null && StringUtils.isNotEmpty(String.valueOf(message))
                    ? String.valueOf(message) : "服务器错误";
        }
        return AjaxResult.error(code, msg);
    }
}
