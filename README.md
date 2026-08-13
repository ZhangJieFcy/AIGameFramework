# AIGameFramework

Three.js + TypeScript 小游戏框架。Web / 微信小游戏 / 抖音小游戏三端工程，内置界面、音频、对象池、资源、事件、输入、定时器、缓动、存档、配置、随机、日志。

以后做新游戏：克隆本仓库，主要改 `src/game/`，不要改 `src/framework/`。

仓库地址：https://github.com/ZhangJieFcy/AIGameFramework.git

## 平台支持现状

| 平台 | 状态 | 说明 |
|------|------|------|
| Web | ✅ 可用 | `npm run dev` / `npm run build:web` |
| 微信小游戏 | 🚧 桥接可用 | `npm run build:wechat` 出包；3D 渲染 / 输入 / 资源 / 存档已桥接 |
| 抖音小游戏 | 🚧 桥接可用 | `npm run build:douyin` 出包；同上 |

> ⚠️ 小游戏端说明：已用 IIFE 单包 + 适配器打通主循环、触摸输入、本地 JSON 读取和贴图加载，
> 但 DOM 版 UI（`UIManager`）在小游戏端是无渲染占位，广告 / 分享等业务能力为占位实现，
> 真机表现仍需按开发者工具与真机控制台逐项验证。

## 新开一个游戏

```bash
git clone https://github.com/ZhangJieFcy/AIGameFramework.git my-new-game
cd my-new-game
npm install
npm run dev
```

浏览器打开提示的本地地址。不要用 `file://` 双击 html（配置是 `fetch` 读的，会黑屏或加载失败）。

然后编辑：

- `src/game/MyGame.ts` — 玩法
- `src/game/ui/` — 面板（可复制 HudView 改）
- `public/config/game.json` — 数值
- `public/config/manifest.json` — 预加载的贴图 / JSON
- `public/audio/` — 放入 mp3 后在游戏里 `ctx.audio.register`

## 开箱即用：ctx 里有什么

游戏的 `init(ctx)` / `update(dt, ctx)` 里直接用，不必自己创建。

| 写法 | 做什么 | 例子 |
|------|--------|------|
| `ctx.ui` | 界面开关、叠层 | `ctx.ui.register(view)` `ctx.ui.open("hud")` `ctx.ui.closeTop()` |
| `ctx.audio` | 音乐音效、静音 | `register` → `playBgm("bgm")` / `playSfx("click")` |
| `ctx.assets` | 贴图、JSON、清单 | `await ctx.assets.loadTexture("./img/a.png", "a")` |
| `ctx.pool` | 对象池 | `register` → `warmup` → `acquire` / `release` |
| `ctx.bus` | 事件 | `on` / `once` / `emit` |
| `ctx.input` | 点击、键盘 | `onTap(() => {})` `justTapped` |
| `ctx.scheduler` | 延时、循环 | `delay(1, fn)` `interval(0.5, fn)` |
| `ctx.tween` | 数字缓动 | `start({ from, to, duration, onUpdate })` |
| `ctx.save` | 存档 | 实现游戏的 `save`/`load` 即可自动存（自带版本号） |
| `ctx.config` | 读 game.json | `getString("gameName", "")` |
| `ctx.rng` | 随机 | `int(1,6)` `float()` `pick(list)` |
| `ctx.log` | 日志 | `info` / `warn` / `error` |
| `ctx.screen` | 宽高 | `width` `height` `isPortrait` |
| `ctx.platform` | 端、分享、震动、广告 | `id` `share` `vibrate` `playRewardAd` |
| `ctx.scene` 等 | Three.js | `scene` `camera` `renderer` `time` `mount` |

每个管理器源码文件**最顶部**都有「功能说明 + 常用写法」。不会写程序时：复制示例，只改名字和数字。

## 你只需要实现的接口

```ts
export interface IGame {
  init(ctx: GameContext): Promise<void> | void;
  update(dt: number, ctx: GameContext): void;
  save?(): unknown;
  load?(data: unknown): void;
}
```

## 常见需求怎么写

**新面板：** 复制 `src/game/ui/HudView.ts`，改 `name`，在 `init` 里 `ctx.ui.register` 后 `open`。

**出声：** mp3 放到 `public/audio/click.mp3`，然后：

```ts
ctx.audio.register("click", "./audio/click.mp3");
ctx.audio.playSfx("click");
```

**预加载贴图：** 在 `manifest.json` 写 `"textures": { "logo": "./img/logo.png" }`，启动后 `ctx.assets.getTexture("logo")`。

**对象池（子弹）：**

```ts
ctx.pool.register("bullet", () => new Mesh(...), (m) => { m.visible = false });
ctx.pool.warmup("bullet", 20);
const b = ctx.pool.acquire<Mesh>("bullet");
ctx.pool.release("bullet", b);
```

**1 秒后执行：** `ctx.scheduler.delay(1, () => { ... })`

换游戏请改 `saveKey`（例如 `mygame_save_v1`），避免沿用示例存档。

## 命令

所有命令都在项目根目录执行。第一次使用先 `npm install`。

| 命令 | 作用 | 产物 |
|------|------|------|
| `npm run dev` | 本地开发、热更新 | 无，浏览器访问本地地址 |
| `npm run build:web` | Web 发布包 | `dist-web/` |
| `npm run build` | 默认构建（同 web，输出 `dist/`） | `dist/` |
| `npm run build:wechat` | 微信小游戏包（IIFE 单包 + 适配器） | `dist-wechat/` |
| `npm run build:douyin` | 抖音小游戏包（IIFE 单包 + 适配器） | `dist-douyin/` |
| `npm run preview` | 预览 `dist/` | 无 |
| `npm run typecheck` | 类型检查（app + node 两份配置） | 无 |
| `npm test` | 跑框架核心单元测试（vitest） | 无 |

预览 Web 包：`npx vite preview --outDir dist-web`，或用任意本地 HTTP 服务打开 `dist-web`，不要双击 html。

微信 / 抖音包：用对应开发者工具「导入项目」打开 `dist-wechat/` / `dist-douyin/`，控制台应出现 `runtime ready` 与示例游戏启动日志。

## 目录

```
src/framework/   框架（一般不用改）
  audio/ ui/ input/ screen/ core/ platform/ render/
src/game/        游戏逻辑（你主要改这里）
public/config/   配置表（game.json / manifest.json）
scripts/         构建脚本与小游戏适配器
.github/workflows/  CI（push 自动 typecheck + test + 三端构建）
```

## 小游戏构建原理（想深挖再看）

浏览器页面用默认 `vite.config.ts`（ES Module）。微信 / 抖音运行时只认 CommonJS 的
`require()`，所以小游戏包用 `vite.minigame.config.ts` 把整个应用（含 three.js）打成
单个 IIFE 文件，再由 `scripts/build-wechat.mjs` / `scripts/build-douyin.mjs` 组装
`game.js`、`game.json` 和平台适配器。适配器补齐了本地 JSON 读取（fetch）、贴图
（`wx/tt.createImage`）、触摸 → 指针事件等桥接，游戏代码不需要写平台专用分支。

## 开发规范

- 提交前跑 `npm run typecheck` 和 `npm test`，push 后 CI 会再验一遍三端构建。
- 存档结构变更：`SaveSystem` 的 `VERSION` +1，并在 `load` 里做旧版本迁移。
- 改框架请保持「管理器顶部注释 + ctx 注入」的既有模式。
