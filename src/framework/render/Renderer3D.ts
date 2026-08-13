import { PerspectiveCamera, Scene, WebGLRenderer } from "three";

export class Renderer3D {
  public readonly scene = new Scene();
  public readonly camera: PerspectiveCamera;
  public readonly renderer: WebGLRenderer;

  constructor(private readonly mount: HTMLElement) {
    const width = mount.clientWidth || window.innerWidth || 720;
    const height = mount.clientHeight || window.innerHeight || 1280;
    this.camera = new PerspectiveCamera(60, width / height, 0.1, 200);
    this.camera.position.set(0, 2, 6);
    this.renderer = new WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
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
}
