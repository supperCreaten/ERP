import { defineConfig, loadEnv, type UserConfig } from "vite"
import react from "@vitejs/plugin-react"
import Icons from "unplugin-icons/vite"
import { FileSystemIconLoader } from "unplugin-icons/loaders"
import { resolve } from "path"
import tailwindcss from "@tailwindcss/vite"
import { codeInspectorPlugin } from "code-inspector-plugin"
import svgrPlugin from "vite-plugin-svgr"
import { OPTIMIZE_DEPS_INCLUDE } from "./vite/optimize-deps"
import { loadBuildOnlyPlugins } from "./vite/load-build-plugins"
import { loadIconTransform } from "./vite/load-icon-transform"

// https://vitejs.dev/config/
export default defineConfig(async ({ mode }): Promise<UserConfig> => {
  const isDev = mode === "development"
  const env = loadEnv(mode, process.cwd(), "")
  const enableCodeInspector = env.CODE_INSPECTOR === "1"
  const [buildOnlyPlugins, iconTransform] = await Promise.all([
    isDev ? Promise.resolve([]) : loadBuildOnlyPlugins(),
    loadIconTransform(isDev),
  ])

  return {
    base: "./",
    plugins: [
      ...buildOnlyPlugins,
      // https://github.com/pd4d10/vite-plugin-svgr#options
      svgrPlugin({
        // https://react-svgr.com/docs/options/
        svgrOptions: isDev
          ? { plugins: ["@svgr/plugin-jsx"], icon: true }
          : {
              plugins: ["@svgr/plugin-svgo", "@svgr/plugin-jsx"],
              svgoConfig: {
                floatPrecision: 2,
                plugins: [
                  {
                    name: "preset-default",
                    params: {
                      overrides: {
                        removeViewBox: false,
                      },
                    },
                  },
                  {
                    name: "removeAttrs",
                    params: {
                      attrs: "fill",
                    },
                  },
                ],
              },
              icon: true,
            },
      }),
      /**
       * 点击页面 DOM 打开 IDE 并将光标自动定位到源代码位置
       * 默认关闭以加快冷启动；需要时设置环境变量 CODE_INSPECTOR=1
       *
       * macOS 默认组合键 Option + Shift
       * Windows 默认组合键 Alt + Shift
       * 更多用法看 https://inspector.fe-dev.cn/guide/start.html
       */
      ...(isDev && enableCodeInspector
        ? [
            codeInspectorPlugin({
              bundler: "vite",
            }),
          ]
        : []),

      /**
       * 按需加载图标
       * https://github.com/antfu/unplugin-icons
       */
      Icons({
        customCollections: {
          svg: FileSystemIconLoader("./src/icons/svg"),
        },
        transform: iconTransform,
        compiler: "jsx",
        jsx: "react",
        scale: 1,
      }),
      tailwindcss(),
      react(),
    ],
    optimizeDeps: {
      include: OPTIMIZE_DEPS_INCLUDE,
      /** 等待依赖扫描/预构建完成再响应浏览器，避免 Windows 下首次并发请求触发 ERR_NETWORK_CHANGED */
      holdUntilCrawlEnd: true,
    },
    resolve: {
      alias: {
        "@": resolve(__dirname, "./src"),
        "@icons": "unplugin-icons/icons",
      },
    },
    build: {
      /** esbuild 压缩更快；生产通过 esbuild.drop 去掉 console */
      minify: "esbuild",
      target: "es2018",
      /** 生成 .map 供上传反解，不在产物中引用（避免暴露给用户） */
      sourcemap: "hidden",
      cssCodeSplit: true,
      rollupOptions: {
        output: {
          chunkFileNames: `assets/js/[name].[hash:8].js`,
          entryFileNames: `assets/js/[name].[hash:16].js`,
          assetFileNames: `assets/[ext]/[name].[hash:8].[ext]`,
          /**
           * 拆包注意避免 circular chunk：antd 生态与 dayjs 互相依赖，打进同一包。
           * react 独立，便于与业务 chunk 并行下载、长期缓存。
           */
          manualChunks(id) {
            if (!id.includes("node_modules")) return;
            if (
              id.includes("react-dom") ||
              id.includes("react-router") ||
              id.includes("/scheduler/") ||
              /[\\/]react[\\/]/.test(id)
            ) {
              return "react-vendor";
            }
            if (
              id.includes("antd") ||
              id.includes("@ant-design") ||
              id.includes("dayjs")
            ) {
              return "antd";
            }
            if (
              id.includes("@reduxjs") ||
              id.includes("/redux/") ||
              id.includes("immer") ||
              id.includes("axios")
            ) {
              return "utils-vendor";
            }
          },
        },
      },
      modulePreload: {
        polyfill: false,
      },
      reportCompressedSize: true,
      chunkSizeWarningLimit: 800,
    },
    esbuild: {
      drop: isDev ? [] : ["console", "debugger"],
    },
    server: {
      host: "0.0.0.0",
      port: 3000,
      hmr: {
        host: "127.0.0.1",
      },
      open: true,
      proxy: {
        "/api": {
          target: "http://localhost:8080",
          changeOrigin: true,
        },
      },
    },
  }
})
