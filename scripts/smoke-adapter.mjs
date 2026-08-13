// 小游戏适配器冒烟测试：在 vm 沙箱里模拟 wx/tt 环境，验证桥接逻辑真实可用。
// 用法：node scripts/smoke-adapter.mjs [weapp|tt]（默认 weapp）
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const which = process.argv[2] ?? "weapp";
const adapterFile = which === "tt" ? "tt-adapter.js" : "weapp-adapter.js";
const platformKey = which === "tt" ? "tt" : "wx";

const adapterSrc = readFileSync(new URL(`./adapters/${adapterFile}`, import.meta.url), "utf8");

const listeners = {};
const canvas = {
  width: 0,
  height: 0,
  style: {},
  addEventListener(name, cb) {
    listeners[name] = cb;
  }
};

const fs = {
  readFileSync(path) {
    if (path === "config/game.json") return '{"gameName":"mock"}';
    throw new Error("ENOENT " + path);
  }
};

const sandbox = {
  setTimeout,
  clearTimeout,
  console,
  [platformKey]: {
    getSystemInfoSync: () => ({ windowWidth: 375, windowHeight: 667, pixelRatio: 2 }),
    createCanvas: () => canvas,
    getStorageSync: (k) => (k === "has" ? "stored-value" : ""),
    setStorageSync: () => {},
    getFileSystemManager: () => fs,
    createImage: () => ({ onload: null, onerror: null, set src(v) { this._src = v; } }),
    onHide: (cb) => (sandbox.__hiddenCb = cb),
    onShow: () => {},
    request: null
  }
};
sandbox.globalThis = sandbox;
vm.createContext(sandbox);
vm.runInContext(adapterSrc, sandbox);

const g = sandbox;
const failures = [];
const check = (name, cond) => {
  console.log((cond ? "PASS" : "FAIL") + "  " + name);
  if (!cond) failures.push(name);
};

check("window 就绪", !!g.window);
check("window.innerWidth=375", g.window.innerWidth === 375);
check("devicePixelRatio=2", g.window.devicePixelRatio === 2);
check("document.getElementById(app) 返回 mount", g.document.getElementById("app") !== null);
check("mount.clientWidth=375", g.document.getElementById("app").clientWidth === 375);
check("__AIGAME_CANVAS__ 指向 canvas", g.__AIGAME_CANVAS__ === canvas);
check("__AIGAME_STORAGE__ 就绪", !!g.__AIGAME_STORAGE__);
check("HTMLElement 已定义", typeof g.HTMLElement === "function");

// storage 桥接
check("storage.getItem 命中", g.__AIGAME_STORAGE__.getItem("has") === "stored-value");
check("storage.getItem 未命中为 null", g.__AIGAME_STORAGE__.getItem("nope") === null);

// fetch 桥接：本地文件读取
const resp = await g.fetch("./config/game.json");
const data = await resp.json();
check("fetch 读本地 JSON", data.gameName === "mock");
check("fetch 响应 ok/status", resp.ok === true && resp.status === 200);

// 网络 fallback：本地读不到走 wx.request
let requestOpts = null;
g[platformKey].request = (opts) => {
  requestOpts = opts;
  opts.success({ statusCode: 200, data: { from: "network" } });
};
const resp2 = await g.fetch("https://example.com/a.json");
const data2 = await resp2.json();
check("fetch 网络 fallback", data2.from === "network" && requestOpts.url === "https://example.com/a.json");

// Image 桥接
const img = g.document.createElement("img");
check("createElement(img) 返回 createImage", img && "onload" in img);

// 触摸 → 指针事件
let pointerSeen = null;
g.window.addEventListener("pointerdown", (e) => (pointerSeen = e));
listeners.touchstart({ touches: [{ clientX: 10, clientY: 20, identifier: 1 }] });
check("触摸→pointerdown 派发", pointerSeen && pointerSeen.type === "pointerdown" && pointerSeen.clientX === 10 && pointerSeen.clientY === 20);

// 生命周期事件
let paused = false;
g.window.addEventListener("app:pause", () => (paused = true));
sandbox.__hiddenCb();
check("onHide → app:pause", paused === true);

// mount 事件转发（InputManager 挂 mount 上）
let mountTap = 0;
g.document.getElementById("app").addEventListener("pointerdown", () => (mountTap += 1));
listeners.touchstart({ touches: [{ clientX: 1, clientY: 1, identifier: 2 }] });
check("mount 转发 pointerdown", mountTap === 1);

console.log(failures.length === 0 ? "\nALL PASS" : `\n${failures.length} FAILURES: ${failures.join(", ")}`);
process.exit(failures.length === 0 ? 0 : 1);
