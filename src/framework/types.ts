import type { PerspectiveCamera, Scene } from "three";
import type { AudioManager } from "./audio/AudioManager";
import type { AssetLoader, AssetProgress } from "./core/AssetLoader";
import type { Config } from "./core/Config";
import type { EventBus } from "./core/EventBus";
import type { Logger } from "./core/Logger";
import type { Pool } from "./core/Pool";
import type { Random } from "./core/Random";
import type { SaveSystem } from "./core/SaveSystem";
import type { Scheduler } from "./core/Scheduler";
import type { Time } from "./core/Time";
import type { Tween } from "./core/Tween";
import type { InputManager } from "./input/InputManager";
import type { IPlatform } from "./platform/IPlatform";
import type { Renderer3D } from "./render/Renderer3D";
import type { Screen } from "./screen/Screen";
import type { UIManager } from "./ui/UIManager";

/**
 * 框架事件表：框架自己发的事件有具体类型，写错字段会编译报错。
 * 玩法自定义事件（如 "game:score"）走末尾的 Record<string, unknown> 索引，仍可自由使用。
 * - assets:progress  资源加载进度
 * - ui:open / ui:close
 * - audio:mute
 */
export type GameEvents = {
  "assets:progress": AssetProgress;
  "ui:open": { name: string };
  "ui:close": { name: string };
  "audio:mute": boolean;
} & Record<string, unknown>;

/**
 * 游戏上下文：框架能力都从这里拿。
 * 在 IGame.init / update 里用 ctx.xxx，不要自己 new 管理器。
 */
export type GameContext = {
  /** 当前端与分享/广告/震动 */
  platform: IPlatform;
  /** 挂 DOM 的根节点 */
  mount: HTMLElement;
  renderer: Renderer3D;
  scene: Scene;
  camera: PerspectiveCamera;
  /** 画布宽高 */
  screen: Screen;
  /** 帧间隔 */
  time: Time;
  /** 事件总线 */
  bus: EventBus<GameEvents>;
  /** 贴图 / JSON */
  assets: AssetLoader;
  /** game.json */
  config: Config;
  /** 存档 */
  save: SaveSystem;
  /** 背景音乐与音效 */
  audio: AudioManager;
  /** 界面叠层 */
  ui: UIManager;
  /** 对象池 */
  pool: Pool;
  /** 延迟 / 循环定时器 */
  scheduler: Scheduler;
  /** 数字缓动 */
  tween: Tween;
  /** 点击与键盘 */
  input: InputManager;
  /** 随机数 */
  rng: Random;
  /** 日志 */
  log: Logger;
};

/**
 * 你的游戏只要实现这个接口。
 *
 * init    创建场景、注册 UI、预热对象池
 * update  每帧逻辑（dt 单位：秒）
 * save/load 可选，有则自动存档
 */
export interface IGame {
  /** 存档键，换游戏请改名，避免和示例存档混用 */
  readonly saveKey?: string;
  init(ctx: GameContext): Promise<void> | void;
  update(dt: number, ctx: GameContext): void;
  onPause?(ctx: GameContext): void;
  onResume?(ctx: GameContext): void;
  save?(): unknown;
  load?(data: unknown): void;
}
