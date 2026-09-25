package com.erp.system.controller;

import java.awt.image.BufferedImage;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ThreadLocalRandom;
import java.util.concurrent.TimeUnit;
import javax.imageio.ImageIO;

import com.erp.common.annotation.Log;
import com.erp.common.config.ErpConfig;
import com.erp.common.constant.CacheConstants;
import com.erp.common.constant.Constants;
import com.erp.common.core.domain.AjaxResult;
import com.erp.common.core.domain.entity.SysMenu;
import com.erp.common.core.domain.entity.SysUser;
import com.erp.common.core.domain.model.SensitiveDecryptBody;
import com.erp.common.core.redis.RedisCache;
import com.erp.common.core.service.ITokenService;
import com.erp.common.enums.BusinessType;
import com.erp.common.utils.SecurityUtils;
import com.erp.common.utils.ServletUtils;
import com.erp.common.utils.StringUtils;
import com.erp.common.utils.encrypt.SensitiveDataCrypto;
import com.erp.common.utils.file.FileUploadUtils;
import com.erp.common.utils.file.FileUtils;
import com.erp.common.utils.sign.Base64;
import com.erp.common.utils.uuid.IdUtils;
import com.erp.system.domain.SysFileInfo;
import com.erp.system.service.ISysFileInfoService;
import com.erp.system.service.ISysMenuService;
import com.erp.system.service.ISysUserService;
import com.google.code.kaptcha.Producer;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.annotation.Resource;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.util.FastByteArrayOutputStream;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

/**
 * 首页 / 通用接口 / 验证码 / 锁屏解锁
 *
 * @author finance
 */
@RestController
@Tag(name = "系统首页")
public class SysIndexController {

    private static final Logger log = LoggerFactory.getLogger(SysIndexController.class);

    private static final String CAPTCHA_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";

    @Autowired
    private ISysUserService userService;
    @Autowired
    private ISysMenuService menuService;
    @Autowired
    private ITokenService tokenService;
    @Autowired
    private ISysFileInfoService fileInfoService;
    @Autowired
    private RedisCache redisCache;

    @Resource(name = "captchaProducer")
    private Producer captchaProducer;

    @Resource(name = "captchaProducerMath")
    private Producer captchaProducerMath;

    @Operation(summary = "刷新 accessToken")
    @GetMapping("/refreshToken")
    public AjaxResult refreshToken(HttpServletRequest request) {
        String refreshToken = readCookie(request, "refreshToken");
        return AjaxResult.success("操作成功", tokenService.refreshAccessToken(refreshToken));
    }

    @Operation(summary = "获取授权路由")
    @GetMapping("/authRoutes")
    public AjaxResult authRoutes() {
        Long userId = SecurityUtils.getUserId();
        List<SysMenu> menus = menuService.selectMenuTreeByUserId(userId);
        return AjaxResult.success(menuService.buildAuthRoutes(menus));
    }

    /**
     * 解锁屏幕
     */
    @Log(title = "解锁屏", businessType = BusinessType.OTHER, excludeParamNames = {"password"})
    @Operation(summary = "解锁屏幕")
    @PostMapping("/unlockscreen")
    public AjaxResult unlockScreen(@RequestBody Map<String, String> body) {
        String password = body.get("password");
        if (StringUtils.isEmpty(password)) {
            return AjaxResult.error("密码不能为空");
        }
        String username = SecurityUtils.getUsername();
        SysUser user = userService.selectUserByUserName(username);
        if (user == null) {
            return AjaxResult.error("服务器超时，请重新登录");
        }
        if (!SecurityUtils.matchesPassword(password, user.getPassword())) {
            return AjaxResult.error("密码错误，请重新输入");
        }
        return AjaxResult.success("解锁成功");
    }

    /**
     * 对齐前端 /api/captcha（SVG base64）
     */
    @Operation(summary = "获取验证码")
    @GetMapping("/captcha")
    public AjaxResult captcha(@RequestParam(required = false) String account) {
        String code = randomCode(6);
        String uuid = IdUtils.fastUUID();
        String verifyKey = CacheConstants.CAPTCHA_CODE_KEY + uuid;
        redisCache.setCacheObject(verifyKey, code, Constants.CAPTCHA_EXPIRATION, TimeUnit.MINUTES);

        String svg = buildSvgCaptcha(code);
        String base64 = java.util.Base64.getEncoder().encodeToString(svg.getBytes(StandardCharsets.UTF_8));
        Map<String, Object> data = new HashMap<>(2);
        data.put("base64", base64);
        data.put("uuid", uuid);
        return AjaxResult.success(data);
    }

    /**
     * 兼容旧路径
     */
    @GetMapping("/captchaImage")
    public AjaxResult getCode(HttpServletResponse response) throws IOException {
        AjaxResult ajax = AjaxResult.success();
        boolean captchaEnabled = ErpConfig.isCaptchaEnabled();
        ajax.put("captchaEnabled", captchaEnabled);
        if (!captchaEnabled) {
            return ajax;
        }

        String uuid = IdUtils.simpleUUID();
        String verifyKey = CacheConstants.CAPTCHA_CODE_KEY + uuid;

        String capStr = null, code = null;
        BufferedImage image = null;

        String captchaType = ErpConfig.getCaptchaType();
        if ("math".equals(captchaType)) {
            String capText = captchaProducerMath.createText();
            capStr = capText.substring(0, capText.lastIndexOf("@"));
            code = capText.substring(capText.lastIndexOf("@") + 1);
            image = captchaProducerMath.createImage(capStr);
        } else if ("char".equals(captchaType)) {
            capStr = code = captchaProducer.createText();
            image = captchaProducer.createImage(capStr);
        }

        redisCache.setCacheObject(verifyKey, code, Constants.CAPTCHA_EXPIRATION, TimeUnit.MINUTES);
        FastByteArrayOutputStream os = new FastByteArrayOutputStream();
        try {
            ImageIO.write(image, "jpg", os);
        } catch (IOException e) {
            return AjaxResult.error(e.getMessage());
        }

        ajax.put("uuid", uuid);
        ajax.put("img", Base64.encode(os.toByteArray()));
        return ajax;
    }

    /**
     * 敏感信息解密（列表字段各自密钥：phoneCipher+phoneSecretKey / idCardCipher+idCardSecretKey）
     */
    @Operation(summary = "敏感信息解密")
    @PostMapping("/decryptSensitive")
    public AjaxResult decryptSensitive(@RequestBody SensitiveDecryptBody body) {
        if (body == null || StringUtils.isEmpty(body.getCipherText()) || StringUtils.isEmpty(body.getSecretKey())) {
            return AjaxResult.error("密文或密钥不能为空");
        }
        try {
            String plain = SensitiveDataCrypto.decrypt(body.getCipherText(), body.getSecretKey());
            return AjaxResult.success("操作成功", plain);
        } catch (IllegalArgumentException e) {
            return AjaxResult.error(e.getMessage());
        } catch (Exception e) {
            log.error("敏感信息解密失败", e);
            return AjaxResult.error("解密失败，请检查密文或密钥");
        }
    }

    /**
     * 通用下载请求
     *
     * @param fileName 文件名称
     * @param delete 是否删除
     */
    @GetMapping("/download")
    public void fileDownload(String fileName, Boolean delete, HttpServletResponse response, HttpServletRequest request) {
        try {
            if (!FileUtils.checkAllowDownload(fileName)) {
                throw new Exception(StringUtils.format("文件名称({})非法，不允许下载。 ", fileName));
            }
            String realFileName = System.currentTimeMillis() + fileName.substring(fileName.indexOf("_") + 1);
            String filePath = ErpConfig.getDownloadPath() + fileName;

            response.setContentType(MediaType.APPLICATION_OCTET_STREAM_VALUE);
            FileUtils.setAttachmentResponseHeader(response, realFileName);
            FileUtils.writeBytes(filePath, response.getOutputStream());
            if (delete) {
                FileUtils.deleteFile(filePath);
            }
        } catch (Exception e) {
            log.error("下载文件失败", e);
        }
    }

    /**
     * 通用上传请求（单个）
     */
    @Log(title = "文件上传", businessType = BusinessType.OTHER)
    @PostMapping("/upload")
    public AjaxResult uploadFile(@RequestParam("file") MultipartFile file) throws Exception {
        if (file == null || file.isEmpty()) {
            return AjaxResult.error("上传文件不能为空");
        }
        try {
            String filePath = ErpConfig.getUploadPath();
            String fileName = FileUploadUtils.upload(filePath, file);
            String url = getServerUrl() + fileName;
            SysFileInfo saved = fileInfoService.saveUploadFile(file, fileName, url);
            return AjaxResult.success("操作成功", buildUploadData(saved));
        } catch (Exception e) {
            return AjaxResult.error(e.getMessage());
        }
    }

    /**
     * 通用上传请求（多个）
     */
    @Log(title = "文件上传", businessType = BusinessType.OTHER)
    @PostMapping("/uploads")
    public AjaxResult uploadFiles(List<MultipartFile> files) throws Exception {
        if (files == null || files.isEmpty()) {
            return AjaxResult.error("上传文件不能为空");
        }
        try {
            String filePath = ErpConfig.getUploadPath();
            List<Map<String, Object>> list = new ArrayList<>();
            for (MultipartFile file : files) {
                if (file == null || file.isEmpty()) {
                    continue;
                }
                String fileName = FileUploadUtils.upload(filePath, file);
                String url = getServerUrl() + fileName;
                SysFileInfo saved = fileInfoService.saveUploadFile(file, fileName, url);
                list.add(buildUploadData(saved));
            }
            if (list.isEmpty()) {
                return AjaxResult.error("上传文件不能为空");
            }
            return AjaxResult.success("操作成功", list);
        } catch (Exception e) {
            return AjaxResult.error(e.getMessage());
        }
    }

    private static Map<String, Object> buildUploadData(SysFileInfo saved) {
        Map<String, Object> data = new HashMap<>(8);
        data.put("fileId", saved.getFileId());
        data.put("url", saved.getUrl());
        data.put("fileName", saved.getFileName());
        data.put("newFileName", saved.getNewFileName());
        data.put("originalFilename", saved.getOriginalFilename());
        return data;
    }

    /**
     * 本地资源通用下载
     */
    @GetMapping("/download/resource")
    public void resourceDownload(String resource, HttpServletRequest request, HttpServletResponse response)
            throws Exception {
        try {
            if (!FileUtils.checkAllowDownload(resource)) {
                throw new Exception(StringUtils.format("资源文件({})非法，不允许下载。 ", resource));
            }
            String localPath = ErpConfig.getProfile();
            String downloadPath = localPath + FileUtils.stripPrefix(resource);
            String downloadName = StringUtils.substringAfterLast(downloadPath, "/");
            response.setContentType(MediaType.APPLICATION_OCTET_STREAM_VALUE);
            FileUtils.setAttachmentResponseHeader(response, downloadName);
            FileUtils.writeBytes(downloadPath, response.getOutputStream());
        } catch (Exception e) {
            log.error("下载文件失败", e);
        }
    }

    private static String getServerUrl() {
        HttpServletRequest request = ServletUtils.getRequest();
        StringBuffer url = request.getRequestURL();
        String contextPath = request.getServletContext().getContextPath();
        return url.delete(url.length() - request.getRequestURI().length(), url.length()).append(contextPath).toString();
    }

    private static String readCookie(HttpServletRequest request, String name) {
        Cookie[] cookies = request.getCookies();
        if (cookies == null) {
            return null;
        }
        for (Cookie cookie : cookies) {
            if (name.equals(cookie.getName())) {
                return cookie.getValue();
            }
        }
        return null;
    }

    private static String randomCode(int size) {
        StringBuilder sb = new StringBuilder(size);
        ThreadLocalRandom random = ThreadLocalRandom.current();
        for (int i = 0; i < size; i++) {
            sb.append(CAPTCHA_CHARS.charAt(random.nextInt(CAPTCHA_CHARS.length())));
        }
        return sb.toString();
    }

    private static String buildSvgCaptcha(String code) {
        StringBuilder texts = new StringBuilder();
        ThreadLocalRandom random = ThreadLocalRandom.current();
        for (int i = 0; i < code.length(); i++) {
            int x = 18 + i * 20;
            int y = 22 + random.nextInt(6);
            int rotate = random.nextInt(30) - 15;
            String color = String.format("#%02x%02x%02x", 40 + random.nextInt(120), 40 + random.nextInt(120), 40 + random.nextInt(120));
            texts.append("<text x=\"").append(x).append("\" y=\"").append(y)
                    .append("\" fill=\"").append(color)
                    .append("\" font-size=\"20\" font-family=\"sans-serif\" transform=\"rotate(")
                    .append(rotate).append(" ").append(x).append(" ").append(y).append(")\">")
                    .append(code.charAt(i)).append("</text>");
        }
        return "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"150\" height=\"35\" style=\"background:#f0f0f0\">"
                + texts + "</svg>";
    }
}
