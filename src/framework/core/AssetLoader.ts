import { Texture, TextureLoader } from "three";

export class AssetLoader {
  private readonly textureLoader = new TextureLoader();

  public loadTexture(url: string): Promise<Texture> {
    return new Promise((resolve, reject) => {
      this.textureLoader.load(url, resolve, undefined, reject);
    });
  }

  public async loadJson<T>(url: string): Promise<T> {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to load ${url}: ${response.status}`);
    }
    return (await response.json()) as T;
  }
}
