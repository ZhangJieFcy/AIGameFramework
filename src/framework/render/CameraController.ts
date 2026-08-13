import { PerspectiveCamera, Vector3 } from "three";

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
