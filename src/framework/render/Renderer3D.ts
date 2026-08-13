import { PerspectiveCamera, Scene, WebGLRenderer } from "three";

export type RendererOptions = {
  /** 抗锯齿，低端机可关（game.json 的 antialias） */
  antialias?: boolean;
  /** 像素比上限，设 1 最省电（game.json 的 pixelRatio） */
  pixelRatio?: number;
};

/**
 * 3D 渲染
 *
 * 功能说明：
 * 创建 Three.js 场景、相机、WebGL 画布。游戏用 ctx.scene / ctx.camera，不要自己再建 Renderer。
 * 抗锯齿与像素比可从 public/config/game.json 配置：低端机设 "antialias": false、"pixelRatio": 1。
 */
export class Renderer3D {
  public readonly scene = new Scene();
  public readonly camera: PerspectiveCamera;
  public readonly renderer: WebGLRenderer;

  constructor(private readonly mount: HTMLElement, options: RendererOptions = {}) {
    const width = mount.clientWidth || window.innerWidth || 720;
    const height = mount.clientHeight || window.innerHeight || 1280;
    this.camera = new PerspectiveCamera(60, width / height, 0.1, 200);
    this.camera.position.set(0, 2, 6);
    this.renderer = new WebGLRenderer({ antialias: options.antialias ?? true });
    this.renderer.setPixelRatio(
      Math.min(2, Math.max(1, options.pixelRatio ?? Math.min(window.devicePixelRatio || 1, 2)))
    );
    this.renderer.setSize(width, height);
    mount.appendChild(this.renderer.domElement);
  }

  public render(): void {
    this.renderer.render(this.scene, this.camera);
  }

  public onResize(): void {
    const width = this.mount.clientWidth || window.innerWidth || 720;
    const height = this.mount.clientHeight || window.innerHeight || 1280;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  /** 释放 WebGL 上下文与画布（热更新/换场景时调用，避免上下文耗尽） */
  public dispose(): void {
    this.renderer.dispose();
    this.renderer.domElement.remove();
  }
}
