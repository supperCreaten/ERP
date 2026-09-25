package com.erp;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.jdbc.autoconfigure.DataSourceAutoConfiguration;

/**
 * 启动程序
 * 
 * @author finance
 */
@SpringBootApplication(exclude = { DataSourceAutoConfiguration.class })
public class ErpApplication
{
    public static void main(String[] args)
    {
        // System.setProperty("spring.devtools.restart.enabled", "false");
        SpringApplication.run(ErpApplication.class, args);
        System.out.println("(♥◠‿◠)ﾉﾞ  Erp启动成功   ლ(´ڡ`ლ)ﾞ  \n" +
                "  ______   _____    _____   \n" +
                " |  ____| |  __ \\  |  __ \\  \n" +
                " | |__    | |__) | | |__) | \n" +
                " |  __|   |  _  /  |  ___/  \n" +
                " | |____  | | \\ \\  | |      \n" +
                " |______| |_|  \\_\\ |_|      \n");
    }
}
