import Cookies from "js-cookie";

const domain = window.location.hostname;

/** accessToken 写入 Cookie 且值发生变化时触发（含 HTTP 401 刷新、登录等） */
export const ACCESS_TOKEN_CHANGED = "ec:access-token-changed";

/** accessToken 被清除时触发（登出等） */
export const ACCESS_TOKEN_CLEARED = "ec:access-token-cleared";

export function getAccessToken(): string  {
  return Cookies.get("accessToken") || '';
}

export function setAccessToken(token: string): void {
  if (!token) return;
  const prev = getAccessToken();
  Cookies.set("accessToken", token, {
    path: "/",
    domain,
  });
  if (prev !== token) {
    window.dispatchEvent(new CustomEvent(ACCESS_TOKEN_CHANGED, { detail: { token } }));
  }
}

export function removeToken(): void {
  const hadToken = !!getAccessToken();
  Cookies.remove("accessToken", {
    path: "/",
    domain,
  });
  // refreshToken 为服务端 httpOnly Cookie，需调用 /api/logout 清除
  if (hadToken) {
    window.dispatchEvent(new CustomEvent(ACCESS_TOKEN_CLEARED));
  }
}
