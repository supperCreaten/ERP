import axios, { CanceledError, type InternalAxiosRequestConfig } from "axios";

const REFRESH_URL = "/api/refreshToken";

const DEFAULT_MAX_CONCURRENT = 6;

function parseMaxConcurrent() {
  const raw = import.meta.env.VITE_API_MAX_CONCURRENT;
  if (raw == null || raw === "") return DEFAULT_MAX_CONCURRENT;
  const n = raw == null || raw === "" ? NaN : typeof raw === "string" ? parseFloat(raw) : NaN;
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : DEFAULT_MAX_CONCURRENT;
}

export function isCanceledError(error: unknown) {
  return (
    axios.isCancel(error) ||
    error instanceof CanceledError ||
    (error as { code?: string })?.code === "ERR_CANCELED"
  );
}

export function shouldSkipRouteCancel(config: InternalAxiosRequestConfig) {
  if (config.skipRouteCancel) return true;
  const url = config.url ?? "";
  return url.includes(REFRESH_URL);
}

export function shouldSkipConcurrency(config: InternalAxiosRequestConfig) {
  if (config.skipConcurrency) return true;
  const url = config.url ?? "";
  return url.includes(REFRESH_URL);
}

type QueueItem = {
  resolve: () => void;
  reject: (reason?: unknown) => void;
  aborted: boolean;
  signal?: AbortSignal;
  onAbort?: () => void;
};

class ConcurrencyLimiter {
  private readonly max: number;
  private active = 0;
  private queue: QueueItem[] = [];

  constructor(max: number) {
    this.max = max;
  }

  async acquire(signal?: AbortSignal) {
    if (signal?.aborted) {
      throw new CanceledError("请求已取消");
    }
    if (this.active < this.max) {
      this.active++;
      return;
    }

    await new Promise<void>((resolve, reject) => {
      const item: QueueItem = { resolve, reject, aborted: false };
      const onAbort = () => {
        item.aborted = true;
        const index = this.queue.indexOf(item);
        if (index >= 0) {
          this.queue.splice(index, 1);
          this.detachAbortListener(item);
          reject(new CanceledError("请求已取消"));
        }
      };

      if (signal) {
        item.signal = signal;
        item.onAbort = onAbort;
        signal.addEventListener("abort", onAbort);
      }

      this.queue.push(item);
    });

    if (signal?.aborted) {
      this.release();
      throw new CanceledError("请求已取消");
    }
  }

  private detachAbortListener(item: QueueItem) {
    if (item.signal && item.onAbort) {
      item.signal.removeEventListener("abort", item.onAbort);
    }
    item.onAbort = undefined;
    item.signal = undefined;
  }

  release() {
    this.active = Math.max(0, this.active - 1);
    while (this.queue.length) {
      const next = this.queue.shift();
      if (!next || next.aborted) continue;
      this.detachAbortListener(next);
      this.active++;
      next.resolve();
      return;
    }
  }
}

const limiter = new ConcurrencyLimiter(parseMaxConcurrent());
const pendingControllers = new Set<AbortController>();

function mergeAbortSignal(config: InternalAxiosRequestConfig, controller: AbortController) {
  const existing = config.signal;
  if (!existing) {
    config.signal = controller.signal;
    return;
  }
  if (existing.aborted) {
    controller.abort();
    config.signal = controller.signal;
    return;
  }
  const onAbort = () => controller.abort();
  (existing as AbortSignal).addEventListener("abort", onAbort, { once: true });
  config.signal = controller.signal;
}

export async function prepareRequestControl(config: InternalAxiosRequestConfig) {
  const controller = new AbortController();
  config._abortController = controller;

  if (!shouldSkipRouteCancel(config)) {
    pendingControllers.add(controller);
  }

  mergeAbortSignal(config, controller);

  if (!shouldSkipConcurrency(config)) {
    await limiter.acquire(controller.signal);
    config._concurrencyRelease = () => limiter.release();
  }
}

export function finalizeRequestControl(config?: InternalAxiosRequestConfig) {
  if (!config) return;
  config._concurrencyRelease?.();
  config._concurrencyRelease = undefined;
  const controller = config._abortController;
  if (controller) {
    pendingControllers.delete(controller);
    config._abortController = undefined;
  }
}

/** 路由切换时取消尚未完成的业务请求 */
export function cancelPendingRequestsOnRouteChange() {
  for (const controller of pendingControllers) {
    controller.abort();
  }
}

declare module "axios" {
  export interface AxiosRequestConfig {
    /** 路由切换时不自动取消 */
    skipRouteCancel?: boolean;
    /** 不参与全局并发限制 */
    skipConcurrency?: boolean;
  }

  export interface InternalAxiosRequestConfig {
    skipRouteCancel?: boolean;
    skipConcurrency?: boolean;
    _concurrencyRelease?: () => void;
    _abortController?: AbortController;
  }
}
