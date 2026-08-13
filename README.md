# AIGameFramework

Three.js + TypeScript 小游戏框架。已接好 Web / 微信小游戏 / 抖音小游戏打包、存档、生命周期。

以后做新游戏：克隆本仓库，主要改 `src/game/`，不要改 `src/framework/`。

仓库地址：https://github.com/ZhangJieFcy/AIGameFramework.git

## 新开一个游戏

```bash
git clone https://github.com/ZhangJieFcy/AIGameFramework.git my-new-game
cd my-new-game
npm install
npm run dev
```

浏览器打开提示的本地地址。不要用 `file://` 双击 html（配置是 fetch 加载的，会失败）。

然后编辑：

- `src/game/MyGame.ts` — 玩法（场景、规则、UI）
- `public/config/` — 数值和资源路径

## 你只需要实现的接口

```ts
export interface IGame {
  init(ctx: GameContext): Promise<void> | void;
  update(dt: number, ctx: GameContext): void;
  save?(): unknown;
  load?(data: unknown): void;
}
```

`GameContext` 里已经有：

| 字段 | 用途 |
|------|------|
| `platform` | 当前端：web / wechat / douyin，以及存档、分享、广告占位 |
| `scene` / `camera` / `renderer` | Three.js 场景 |
| `time` | 帧间隔 |
| `bus` | 事件总线 |
| `assets` | 贴图 / JSON 加载 |
| `save` | 存档读写 |
| `mount` | 挂 DOM UI 的根节点 |

## 命令

- `npm run dev` 本地开发
- `npm run build:web` 产出 `dist-web/`
- `npm run build:wechat` 产出 `dist-wechat/`（导入微信开发者工具）
- `npm run build:douyin` 产出 `dist-douyin/`（导入抖音开发者工具）

## 目录

```
src/framework/   框架 SDK（一般不用改）
src/game/        游戏逻辑（你主要改这里）
src/main.ts      启动入口
scripts/         微信 / 抖音打包
public/config/   配置表
```

## 说明

当前小游戏适配是可运行桥接层，真机仍需按控制台报错逐项修。示例游戏是旋转方块，用来验证框架能跑通。
