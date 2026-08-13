import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "vite";

/**
 * 微信小游戏包构建。
 *
 * 流程：用 vite.minigame.config.ts 打 IIFE 单文件包（微信运行时不认 ES Module，
 * 不能直接拷贝 Web 的 ESM 产物）→ 组装 game.json / game.js / weapp-adapter.js / project.config.json。
 *
 * 产物：dist-wechat/，用微信开发者工具导入。
 */
const root = process.cwd();
const scriptsDir = dirname(fileURLToPath(import.meta.url));
const miniOut = resolve(root, "dist-minigame");
const outDir = resolve(root, "dist-wechat");

// 直接调 Vite JS API，不 spawn 子进程：不依赖 PATH，避免嵌套 node 的兼容问题
await build({
  root,
  configFile: resolve(scriptsDir, "../vite.minigame.config.ts"),
  logLevel: "info"
});

if (existsSync(outDir)) {
  rmSync(outDir, { recursive: true, force: true });
}
mkdirSync(outDir, { recursive: true });
cpSync(miniOut, outDir, { recursive: true });

writeFileSync(
  resolve(outDir, "game.json"),
  JSON.stringify(
    {
      deviceOrientation: "portrait",
      showStatusBar: "NO",
      networkTimeout: {
        request: 10000,
        connectSocket: 10000,
        uploadFile: 10000,
        downloadFile: 10000
      }
    },
    null,
    2
  ),
  "utf8"
);
writeFileSync(
  resolve(outDir, "game.js"),
  `require("./weapp-adapter.js");\nrequire("./assets/game.bundle.js");\n`,
  "utf8"
);
writeFileSync(
  resolve(outDir, "weapp-adapter.js"),
  readFileSync(resolve(scriptsDir, "adapters/weapp-adapter.js"), "utf8"),
  "utf8"
);
writeFileSync(
  resolve(outDir, "project.config.json"),
  JSON.stringify(
    {
      description: "AIGameFramework",
      setting: {
        urlCheck: false,
        es6: true,
        enhance: true,
        postcss: false,
        minified: true
      }
    },
    null,
    2
  ),
  "utf8"
);

console.log("build-wechat done:", outDir);
