import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";

const root = process.cwd();
const scriptsDir = dirname(fileURLToPath(import.meta.url));
const webOut = resolve(root, "dist-web");
const outDir = resolve(root, "dist-douyin");

execSync("npm run build:web", { stdio: "inherit" });

if (existsSync(outDir)) {
  rmSync(outDir, { recursive: true, force: true });
}
mkdirSync(outDir, { recursive: true });
cpSync(webOut, outDir, { recursive: true });

const jsBundle = pickJsBundle(resolve(outDir, "assets"));
writeFileSync(
  resolve(outDir, "game.json"),
  JSON.stringify({ deviceOrientation: "portrait" }, null, 2),
  "utf8"
);
writeFileSync(
  resolve(outDir, "game.js"),
  `require("./tt-adapter.js");\nrequire("${jsBundle}");\n`,
  "utf8"
);
writeFileSync(
  resolve(outDir, "tt-adapter.js"),
  readFileSync(resolve(scriptsDir, "adapters/tt-adapter.js"), "utf8"),
  "utf8"
);

console.log("build-douyin done:", outDir);

function pickJsBundle(assetsDir) {
  const files = readdirSync(assetsDir);
  const js = files.find((f) => f.startsWith("index-") && f.endsWith(".js"));
  if (!js) {
    throw new Error("assets 中未找到 index-*.js 构建产物");
  }
  return `./assets/${js}`;
}
