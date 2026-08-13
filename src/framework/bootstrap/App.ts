import { AudioManager } from "../audio/AudioManager";
import { AssetLoader } from "../core/AssetLoader";
import { Config } from "../core/Config";
import { EventBus } from "../core/EventBus";
import { Logger } from "../core/Logger";
import { Pool } from "../core/Pool";
import { Random } from "../core/Random";
import { SaveSystem } from "../core/SaveSystem";
import { Scheduler } from "../core/Scheduler";
import { Time } from "../core/Time";
import { Tween } from "../core/Tween";
import { InputManager } from "../input/InputManager";
import { Renderer3D } from "../render/Renderer3D";
import { Screen } from "../screen/Screen";
import { GameContext, GameEvents, IGame } from "../types";
import { UIManager } from "../ui/UIManager";
import { createPlatform } from "./createPlatform";

/**
 * 启动入口（一般不用改）
 * 创建全部管理器 → 读配置/存档 → game.init → 每帧 update
 */
export async function bootstrap(game: IGame): Promise<void> {
  const platform = createPlatform();
  platform.init();

  const g = globalThis as { __AIGAME_MOUNT__?: HTMLElement };
  const mount = document.getElementById("app") ?? g.__AIGAME_MOUNT__;
  if (!mount) {
    throw new Error("#app not found");
  }

  const renderer = new Renderer3D(mount);
  const ui = new UIManager(mount);
  const saveKey = game.saveKey ?? "aigame_save_v1";
  const log = new Logger();
  const ctx: GameContext = {
    platform,
    mount,
    renderer,
    scene: renderer.scene,
    camera: renderer.camera,
    screen: new Screen(mount),
    time: new Time(),
    bus: new EventBus<GameEvents>(),
    assets: new AssetLoader(),
    config: new Config(),
    save: new SaveSystem(platform, saveKey),
    audio: new AudioManager(platform),
    ui,
    pool: new Pool(),
    scheduler: new Scheduler(),
    tween: new Tween(),
    input: new InputManager(mount),
    rng: new Random(),
    log
  };
  ui.bind(ctx);

  try {
    await ctx.config.load("./config/game.json");
  } catch (err) {
    log.warn("未加载到 config/game.json", err);
  }

  try {
    await ctx.assets.loadManifest("./config/manifest.json", (info) => {
      ctx.bus.emit("assets:progress", info);
    });
  } catch (err) {
    log.warn("未加载到 config/manifest.json", err);
  }

  if (game.load) {
    const stored = ctx.save.load(null);
    if (stored !== null) {
      game.load(stored);
    }
  }

  await game.init(ctx);

  const persist = (): void => {
    if (game.save) {
      ctx.save.save(game.save());
    }
    ctx.audio.pauseAll();
    ctx.scheduler.pause();
    game.onPause?.(ctx);
  };

  window.addEventListener("resize", () => {
    renderer.onResize();
    ctx.screen.refresh();
  });
  window.addEventListener("beforeunload", persist);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      persist();
    } else {
      ctx.scheduler.resume();
      ctx.audio.resumeBgm();
      game.onResume?.(ctx);
    }
  });
  window.addEventListener("app:pause", persist as EventListener);
  window.addEventListener("app:resume", () => {
    ctx.scheduler.resume();
    ctx.audio.resumeBgm();
    game.onResume?.(ctx);
  });

  const tick = (): void => {
    try {
      const dt = ctx.time.tick();
      ctx.scheduler.update(dt);
      ctx.tween.update(dt);
      ctx.ui.update(dt);
      game.update(dt, ctx);
      ctx.input.endFrame();
      renderer.render();
    } catch (err) {
      // 单帧出错不能杀死主循环：记日志后下一帧继续，方便真机排查
      console.error("[AIGame] 帧更新异常", err);
    }
    requestAnimationFrame(tick);
  };
  tick();
}
