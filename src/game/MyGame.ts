import {
  AmbientLight,
  BoxGeometry,
  Color,
  DirectionalLight,
  Mesh,
  MeshStandardMaterial
} from "three";
import { CameraController, GameContext, IGame } from "../framework";

type SaveData = {
  clicks: number;
};

/**
 * 以后做新游戏：主要改这个文件（以及同目录下你自己加的玩法文件）。
 * 框架（平台、渲染循环、存档、打包）不用动。
 */
export class MyGame implements IGame {
  public readonly saveKey = "aigame_sample_v1";
  private cube: Mesh | null = null;
  private cameraCtrl: CameraController | null = null;
  private clicks = 0;
  private hud: HTMLDivElement | null = null;

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

    this.hud = document.createElement("div");
    this.hud.style.cssText =
      "position:absolute;left:12px;top:12px;padding:10px 12px;border-radius:10px;" +
      "background:rgba(0,0,0,0.55);color:#fff;font-family:Arial,sans-serif;line-height:1.6;";
    ctx.mount.appendChild(this.hud);

    ctx.mount.addEventListener("pointerdown", () => {
      this.clicks += 1;
      if (this.cube) {
        (this.cube.material as MeshStandardMaterial).color.setHSL(Math.random(), 0.65, 0.55);
      }
    });

    this.refreshHud(ctx);
  }

  public update(dt: number, ctx: GameContext): void {
    if (this.cube) {
      this.cube.rotation.y += dt * 0.8;
      this.cube.rotation.x += dt * 0.35;
    }
    this.cameraCtrl?.update(dt);
    this.refreshHud(ctx);
  }

  private refreshHud(ctx: GameContext): void {
    if (!this.hud) {
      return;
    }
    this.hud.innerHTML =
      `AIGameFramework 示例<br>` +
      `平台: ${ctx.platform.id}<br>` +
      `点击次数: ${this.clicks}<br>` +
      `请编辑 src/game/MyGame.ts 开始做你的游戏`;
  }
}
