import Cookies from "js-cookie";

/** 与后端 token.expireTime（秒）对齐：accessToken Cookie 持久化时长 */
const ACCESS_TOKEN_EXPIRE_DAYS = 1 / 24; // 1 小时

/** accessToken 写入 Cookie 且值发生变化时触发（含 HTTP 401 刷新、登录等） */
export const ACCESS_TOKEN_CHANGED = "ec:access-token-changed";

/** accessToken 被清除时触发（登出等） */
export const ACCESS_TOKEN_CLEARED = "ec:access-token-cleared";

const COOKIE_OPTS = {
  path: "/",
  // 不设置 domain：避免 localhost / IP 下会话 Cookie 写入异常
} as const;

export function getAccessToken(): string {
  return Cookies.get("accessToken") || "";
}

function clearAccessTokenCookies() {
  Cookies.remove("accessToken", COOKIE_OPTS);
  // 兼容旧版曾带 domain 写入的 Cookie，避免关页后读到空/脏值
  Cookies.remove("accessToken", { path: "/", domain: window.location.hostname });
}

export function setAccessToken(token: string): void {
  if (!token) return;
  const prev = getAccessToken();
  clearAccessTokenCookies();
  Cookies.set("accessToken", token, {
    ...COOKIE_OPTS,
    /** 未设 expires 时为会话 Cookie，关浏览器即丢失 */
    expires: ACCESS_TOKEN_EXPIRE_DAYS,
  });
  if (prev !== token) {
    window.dispatchEvent(new CustomEvent(ACCESS_TOKEN_CHANGED, { detail: { token } }));
  }
}

export function removeToken(): void {
  const hadToken = !!getAccessToken();
  clearAccessTokenCookies();
  // refreshToken 为服务端 httpOnly Cookie，需调用 /api/logout 清除
  if (hadToken) {
    window.dispatchEvent(new CustomEvent(ACCESS_TOKEN_CLEARED));
  }
}
