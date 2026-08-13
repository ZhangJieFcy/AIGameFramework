import type { PerspectiveCamera, Scene } from "three";
import type { AssetLoader } from "./core/AssetLoader";
import type { EventBus } from "./core/EventBus";
import type { SaveSystem } from "./core/SaveSystem";
import type { Time } from "./core/Time";
import type { IPlatform } from "./platform/IPlatform";
import type { Renderer3D } from "./render/Renderer3D";

export type GameEvents = Record<string, unknown>;

export type GameContext = {
  platform: IPlatform;
  mount: HTMLElement;
  renderer: Renderer3D;
  scene: Scene;
  camera: PerspectiveCamera;
  time: Time;
  bus: EventBus<GameEvents>;
  assets: AssetLoader;
  save: SaveSystem;
};

export interface IGame {
  /** 存档键，默认 aigame_save_v1 */
  readonly saveKey?: string;
  init(ctx: GameContext): Promise<void> | void;
  update(dt: number, ctx: GameContext): void;
  onPause?(ctx: GameContext): void;
  onResume?(ctx: GameContext): void;
  /** 返回要写入存档的数据；不实现则不自动存档 */
  save?(): unknown;
  /** 启动时若有存档会调用 */
  load?(data: unknown): void;
}
