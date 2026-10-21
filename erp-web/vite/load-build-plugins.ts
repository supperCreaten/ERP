import type { Plugin } from "vite";

export async function loadBuildOnlyPlugins(): Promise<Plugin[]> {
  const [{ default: ViteImageOptimize }, { default: viteCompression }] =
    await Promise.all([
      import("vite-plugin-imagemin"),
      import("vite-plugin-compression"),
    ]);

  return [
    ViteImageOptimize({
      optipng: { optimizationLevel: 6 },
      pngquant: { quality: [0.6, 0.8], speed: 4 },
      mozjpeg: { quality: 80 },
      svgo: {
        plugins: [{ removeViewBox: false }],
      },
    }),
    viteCompression({
      algorithm: "gzip",
      ext: ".gz",
      deleteOriginFile: false,
      threshold: 1024 * 10,
      verbose: true,
      disable: false,
      compressionOptions: {
        level: 9,
        chunkSize: 1024 * 10,
        windowBits: 15,
        memLevel: 9,
      },
    }),
    viteCompression({
      algorithm: "brotliCompress",
      ext: ".br",
      deleteOriginFile: false,
      threshold: 1024 * 10,
      verbose: true,
      disable: false,
    }),
  ];
}
