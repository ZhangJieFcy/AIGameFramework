import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "vite";

/**
 * 抖音小游戏包构建。
 *
 * 流程：用 vite.minigame.config.ts 打 IIFE 单文件包（抖音运行时不认 ES Module，
 * 不能直接拷贝 Web 的 ESM 产物）→ 组装 game.json / game.js / tt-adapter.js。
 *
 * 产物：dist-douyin/，用抖音开发者工具导入。
 */
const root = process.cwd();
const scriptsDir = dirname(fileURLToPath(import.meta.url));
const miniOut = resolve(root, "dist-minigame");
const outDir = resolve(root, "dist-douyin");

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
  JSON.stringify({ deviceOrientation: "portrait" }, null, 2),
  "utf8"
);
writeFileSync(
  resolve(outDir, "game.js"),
  `require("./tt-adapter.js");\nrequire("./assets/game.bundle.js");\n`,
  "utf8"
);
writeFileSync(
  resolve(outDir, "tt-adapter.js"),
  readFileSync(resolve(scriptsDir, "adapters/tt-adapter.js"), "utf8"),
  "utf8"
);

console.log("build-douyin done:", outDir);
