import { AssetLoader } from "../core/AssetLoader";
import { EventBus } from "../core/EventBus";
import { SaveSystem } from "../core/SaveSystem";
import { Time } from "../core/Time";
import { Renderer3D } from "../render/Renderer3D";
import { GameContext, GameEvents, IGame } from "../types";
import { createPlatform } from "./createPlatform";

export async function bootstrap(game: IGame): Promise<void> {
  const platform = createPlatform();
  platform.init();

  const g = globalThis as { __AIGAME_MOUNT__?: HTMLElement };
  const mount = document.getElementById("app") ?? g.__AIGAME_MOUNT__;
  if (!mount) {
    throw new Error("#app not found");
  }

  const renderer = new Renderer3D(mount);
  const saveKey = game.saveKey ?? "aigame_save_v1";
  const save = new SaveSystem(platform, saveKey);
  const ctx: GameContext = {
    platform,
    mount,
    renderer,
    scene: renderer.scene,
    camera: renderer.camera,
    time: new Time(),
    bus: new EventBus<GameEvents>(),
    assets: new AssetLoader(),
    save
  };

  if (game.load) {
    const stored = save.load(null);
    if (stored !== null) {
      game.load(stored);
    }
  }

  await game.init(ctx);

  const persist = (): void => {
    if (!game.save) {
      return;
    }
    save.save(game.save());
    game.onPause?.(ctx);
  };

  window.addEventListener("resize", () => renderer.onResize());
  window.addEventListener("beforeunload", persist);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      persist();
    } else {
      game.onResume?.(ctx);
    }
  });
  window.addEventListener("app:pause", persist as EventListener);
  window.addEventListener("app:resume", () => game.onResume?.(ctx));

  const tick = (): void => {
    const dt = ctx.time.tick();
    game.update(dt, ctx);
    renderer.render();
    requestAnimationFrame(tick);
  };
  tick();
}
