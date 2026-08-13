import { resolve } from "node:path";
import { defineConfig } from "vite";

/**
 * 小游戏（微信 / 抖音）专用构建配置。
 *
 * 和 Web 构建不同：微信/抖音小游戏运行时用 CommonJS 的 require() 加载代码，
 * 不认 ES Module。所以这里把整个应用（含 three.js）打成一个 IIFE 单文件包，
 * 由 scripts/build-wechat.mjs / scripts/build-douyin.mjs 组装进小游戏工程。
 *
 * 不要用这个配置构建浏览器页面（浏览器用默认 vite.config.ts）。
 */
export default defineConfig({
  base: "./",
  build: {
    outDir: "dist-minigame",
    emptyOutDir: true,
    rollupOptions: {
      input: resolve(process.cwd(), "src/main.ts"),
      output: {
        format: "iife",
        entryFileNames: "assets/game.bundle.js",
        inlineDynamicImports: true
      }
    }
  }
});
