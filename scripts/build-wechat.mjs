import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";

const root = process.cwd();
const scriptsDir = dirname(fileURLToPath(import.meta.url));
const webOut = resolve(root, "dist-web");
const outDir = resolve(root, "dist-wechat");

execSync("npm run build:web", { stdio: "inherit" });

if (existsSync(outDir)) {
  rmSync(outDir, { recursive: true, force: true });
}
mkdirSync(outDir, { recursive: true });
cpSync(webOut, outDir, { recursive: true });

const jsBundle = pickJsBundle(resolve(outDir, "assets"));
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
  `require("./weapp-adapter.js");\nrequire("${jsBundle}");\n`,
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

function pickJsBundle(assetsDir) {
  const files = readdirSync(assetsDir);
  const js = files.find((f) => f.startsWith("index-") && f.endsWith(".js"));
  if (!js) {
    throw new Error("assets 中未找到 index-*.js 构建产物");
  }
  return `./assets/${js}`;
}
