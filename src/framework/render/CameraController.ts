import { PerspectiveCamera, Vector3 } from "three";

/**
 * 相机朝向
 *
 * 功能说明：
 * 让相机一直看向某个点。第三人称跟随时每帧 setLookAt 再 update。
 *
 * 常用：
 * const cam = new CameraController(ctx.camera)
 * cam.setLookAt(0, 0, 0)
 * cam.update(dt)
 */
export class CameraController {
  private readonly lookAt = new Vector3(0, 0, 0);

  constructor(private readonly camera: PerspectiveCamera) {}

  public setLookAt(x: number, y: number, z: number): void {
    this.lookAt.set(x, y, z);
  }

  public update(_dt: number): void {
    this.camera.lookAt(this.lookAt);
  }
}
