package com.erp.framework.manager.factory;

import java.util.TimerTask;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import com.erp.common.constant.Constants;
import com.erp.common.utils.LogUtils;
import com.erp.common.utils.ServletUtils;
import com.erp.common.utils.StringUtils;
import com.erp.common.utils.http.UserAgentUtils;
import com.erp.common.utils.ip.AddressUtils;
import com.erp.common.utils.ip.IpUtils;
import com.erp.common.utils.spring.SpringUtils;
import com.erp.system.domain.SysLogininfor;
import com.erp.system.domain.SysOperLog;
import com.erp.system.service.ISysLogininforService;
import com.erp.system.service.ISysOperLogService;

/**
 * 异步工厂（产生任务用）
 * 
 * @author finance
 */
public class AsyncFactory
{
    private static final Logger sys_user_logger = LoggerFactory.getLogger("sys-user");

    /**
     * 记录登录信息
     * 
     * @param username 用户名
     * @param status 状态
     * @param message 消息
     * @param args 列表
     * @return 任务task
     */
    public static TimerTask recordLogininfor(final String username, final String status, final String message,
            final Object... args)
    {
        final String userAgent = ServletUtils.getRequest().getHeader("User-Agent");
        final String ip = IpUtils.getIpAddr();
        return new TimerTask()
        {
            @Override
            public void run()
            {
                String address = AddressUtils.getRealAddressByIP(ip);
                StringBuilder s = new StringBuilder();
                s.append(LogUtils.getBlock(ip));
                s.append(address);
                s.append(LogUtils.getBlock(username));
                s.append(LogUtils.getBlock(status));
                s.append(LogUtils.getBlock(message));
                // 打印信息到日志
                sys_user_logger.info(s.toString(), args);
                // 获取客户端操作系统
                String os = UserAgentUtils.getOperatingSystem(userAgent);
                // 获取客户端浏览器
                String browser = UserAgentUtils.getBrowser(userAgent);
                // 封装对象
                SysLogininfor logininfor = new SysLogininfor();
                logininfor.setUserName(username);
                logininfor.setIpaddr(ip);
                logininfor.setLoginLocation(address);
                logininfor.setBrowser(browser);
                logininfor.setOs(os);
                logininfor.setUserAgent(StringUtils.substring(userAgent, 0, 500));
                logininfor.setClientType("web");
                logininfor.setMsg(message);
                // 日志状态
                if (StringUtils.equalsAny(status, Constants.LOGIN_SUCCESS, Constants.LOGOUT, Constants.REGISTER))
                {
                    logininfor.setStatus(Constants.SUCCESS);
                }
                else if (Constants.LOGIN_FAIL.equals(status))
                {
                    logininfor.setStatus(Constants.FAIL);
                }
                // 插入数据（表缺失时不影响登录主流程）
                try
                {
                    SpringUtils.getBean(ISysLogininforService.class).insertLogininfor(logininfor);
                }
                catch (Exception e)
                {
                    sys_user_logger.warn("写入登录日志失败: {}", e.getMessage());
                }
            }
        };
    }

    /**
     * 操作日志记录
     */
    public static TimerTask recordOper(final SysOperLog operLog)
    {
        return new TimerTask()
        {
            @Override
            public void run()
            {
                try
                {
                    if (StringUtils.isEmpty(operLog.getOperLocation()) && StringUtils.isNotEmpty(operLog.getOperIp()))
                    {
                        operLog.setOperLocation(AddressUtils.getRealAddressByIP(operLog.getOperIp()));
                    }
                    SpringUtils.getBean(ISysOperLogService.class).insertOperlog(operLog);
                }
                catch (Exception e)
                {
                    sys_user_logger.warn("写入操作日志失败: {}", e.getMessage(), e);
                }
            }
        };
    }
}
