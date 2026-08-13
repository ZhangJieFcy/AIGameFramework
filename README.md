# AIGameFramework

Three.js + TypeScript 小游戏框架。已接好 Web / 微信小游戏 / 抖音小游戏，以及界面、音频、对象池、资源、事件、输入、定时器、缓动、存档。

以后做新游戏：克隆本仓库，主要改 `src/game/`，不要改 `src/framework/`。

仓库地址：https://github.com/ZhangJieFcy/AIGameFramework.git

## 新开一个游戏

```bash
git clone https://github.com/ZhangJieFcy/AIGameFramework.git my-new-game
cd my-new-game
npm install
npm run dev
```

浏览器打开提示的本地地址。不要用 `file://` 双击 html。

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
| `ctx.save` | 存档 | 实现游戏的 `save`/`load` 即可自动存 |
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

- `npm run dev` 本地开发
- `npm run build:web` 产出 `dist-web/`
- `npm run build:wechat` 产出 `dist-wechat/`（导入微信开发者工具）
- `npm run build:douyin` 产出 `dist-douyin/`（导入抖音开发者工具）

## 目录

```
src/framework/   框架（一般不用改）
  audio/ ui/ input/ screen/ core/ platform/ render/
src/game/        游戏逻辑（你主要改这里）
public/config/   配置表
```

## 说明

当前小游戏适配是可运行桥接层，真机仍需按控制台报错逐项修。示例是旋转方块，用来验证框架能跑通。
