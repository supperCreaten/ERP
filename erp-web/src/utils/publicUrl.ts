function sniffImageMimeFromBytes(bytes: Uint8Array): string {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return "image/jpeg";
  }
  if (bytes.length >= 4 && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) {
    return "image/png";
  }
  if (bytes.length >= 3 && bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46) {
    return "image/gif";
  }
  if (
    bytes.length >= 12 &&
    bytes.subarray(0, 4).toString() === "RIFF" &&
    bytes.subarray(8, 12).toString() === "WEBP"
  ) {
    return "image/webp";
  }
  return "image/png";
}

/** userInfo 下发纯 base64（无 data: 前缀）时转为 img 可用的 data URL */
function tryPureBase64ImageToDataUrl(s: string): string | undefined {
  const compact = s.replace(/\s/g, "");
  if (compact.length < 24 || !/^[A-Za-z0-9+/]+=*$/.test(compact)) {
    return undefined;
  }
  try {
    const bin = atob(compact);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) {
      bytes[i] = bin.charCodeAt(i);
    }
    const mime = sniffImageMimeFromBytes(bytes);
    return `data:${mime};base64,${compact}`;
  } catch {
    return undefined;
  }
}

/** 将站点相对路径、data URL、或接口返回的头像 base64 转为可展示的 URL */
export function resolvePublicUrl(path?: unknown): string | undefined {
  if (path == null || path === "") {
    return undefined;
  }
  if (typeof path !== "string") {
    return undefined;
  }
  const s = path.trim();
  if (!s) {
    return undefined;
  }
  if (/^https?:\/\//i.test(s) || s.startsWith("data:")) {
    return s;
  }
  const fromB64 = tryPureBase64ImageToDataUrl(s);
  if (fromB64) {
    return fromB64;
  }
  const p = s.startsWith("/") ? s : `/${s}`;
  const base = import.meta.env.VITE_API_URL;
  if (!base || base === "/") {
    return p;
  }
  return `${`${base}`.replace(/\/$/, "")}${p}`;
}
