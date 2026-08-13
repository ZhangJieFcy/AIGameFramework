import {
  AmbientLight,
  BoxGeometry,
  Color,
  DirectionalLight,
  Mesh,
  MeshStandardMaterial
} from "three";
import { CameraController, GameContext, IGame } from "../framework";
import { HelpView } from "./ui/HelpView";
import { HudView } from "./ui/HudView";

type SaveData = {
  clicks: number;
};

/**
 * 示例游戏：旋转方块。以后做新游戏主要改 src/game/ 这里。
 * 框架能力通过 ctx 调用，文件顶部注释里有用法。
 */
export class MyGame implements IGame {
  public readonly saveKey = "aigame_sample_v1";
  private cube: Mesh | null = null;
  private cameraCtrl: CameraController | null = null;
  private clicks = 0;
  private readonly hud = new HudView();

  public load(data: unknown): void {
    const parsed = data as SaveData;
    if (parsed && Number.isFinite(parsed.clicks)) {
      this.clicks = Math.max(0, Math.floor(parsed.clicks));
    }
  }

  public save(): SaveData {
    return { clicks: this.clicks };
  }

  public init(ctx: GameContext): void {
    ctx.log.info("示例游戏启动", ctx.platform.id);
    ctx.scene.background = new Color(0x1b2433);

    ctx.scene.add(new AmbientLight(0xffffff, 0.7));
    const sun = new DirectionalLight(0xffffff, 1.1);
    sun.position.set(4, 8, 6);
    ctx.scene.add(sun);

    this.cube = new Mesh(
      new BoxGeometry(1.4, 1.4, 1.4),
      new MeshStandardMaterial({ color: 0x4da3ff })
    );
    ctx.scene.add(this.cube);

    this.cameraCtrl = new CameraController(ctx.camera);
    this.cameraCtrl.setLookAt(0, 0, 0);

    ctx.ui.register(this.hud);
    ctx.ui.register(new HelpView());
    this.hud.gameName = ctx.config.getString("gameName", "示例游戏");
    this.hud.platform = ctx.platform.id;
    this.hud.clicks = this.clicks;
    ctx.ui.open("hud");

    ctx.audio.setBgmVolume(ctx.config.getNumber("bgmVolume", 0.6));
    ctx.audio.setSfxVolume(ctx.config.getNumber("sfxVolume", 1));
    // 把 mp3 放到 public/audio/ 后取消下面两行注释即可出声：
    // ctx.audio.register("bgm", "./audio/bgm.mp3", { loop: true });
    // ctx.audio.register("click", "./audio/click.mp3");

    ctx.pool.register(
      "dummy",
      () => ({ active: true }),
      (obj) => {
        obj.active = false;
      }
    );
    ctx.pool.warmup("dummy", 4);

    ctx.input.onTap(() => {
      this.clicks += 1;
      this.hud.clicks = this.clicks;
      ctx.platform.vibrate(15);
      ctx.audio.playSfx("click");
      ctx.bus.emit("game:click", this.clicks);
      if (!this.cube) {
        return;
      }
      (this.cube.material as MeshStandardMaterial).color.setHSL(ctx.rng.float(0, 1), 0.65, 0.55);
      ctx.tween.killAll();
      ctx.tween.start({
        from: 1.25,
        to: 1,
        duration: 0.22,
        ease: "quadOut",
        onUpdate: (v) => this.cube?.scale.setScalar(v)
      });
    });
  }

  public update(dt: number, ctx: GameContext): void {
    if (this.cube) {
      this.cube.rotation.y += dt * 0.8;
      this.cube.rotation.x += dt * 0.35;
    }
    this.cameraCtrl?.update(dt);
  }
}
