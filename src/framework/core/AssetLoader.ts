import { Texture, TextureLoader } from "three";

export type AssetManifest = {
  textures?: Record<string, string>;
  json?: Record<string, string>;
};

export type AssetProgress = {
  loaded: number;
  total: number;
  key: string;
};

/**
 * 资源加载
 *
 * 功能说明：
 * 加载贴图、JSON，并按名字缓存。同一地址不会重复下载。
 * 建议把资源列表写在 public/config/manifest.json，启动时 loadManifest。
 *
 * 常用：
 * await ctx.assets.loadManifest("/config/manifest.json")
 * const tex = ctx.assets.getTexture("logo")
 * const data = await ctx.assets.loadJson("/config/levels.json")
 * const tex2 = await ctx.assets.loadTexture("/img/a.png", "a")
 */
export class AssetLoader {
  private readonly textureLoader = new TextureLoader();
  private readonly textures = new Map<string, Texture>();
  private readonly json = new Map<string, unknown>();
  private readonly inflight = new Map<string, Promise<unknown>>();

  public async loadManifest(
    url = "/config/manifest.json",
    onProgress?: (info: AssetProgress) => void
  ): Promise<void> {
    const manifest = await this.loadJson<AssetManifest>(url, "manifest");
    const textures = Object.entries(manifest.textures ?? {});
    const jsonFiles = Object.entries(manifest.json ?? {});
    const total = textures.length + jsonFiles.length;
    let loaded = 0;

    const tick = (key: string): void => {
      loaded += 1;
      onProgress?.({ loaded, total, key });
    };

    // 并行加载更快；单个资源失败只警告、继续加载其余资源，不再中断整个清单
    const tasks: Promise<void>[] = [];
    for (const [key, path] of textures) {
      tasks.push(
        this.loadTexture(path, key)
          .then(() => tick(key))
          .catch((err) => {
            console.warn(`[AIGame] 贴图加载失败: ${path}`, err);
            tick(key);
          })
      );
    }
    for (const [key, path] of jsonFiles) {
      if (key === "manifest") {
        tick(key);
        continue;
      }
      tasks.push(
        this.loadJson(path, key)
          .then(() => tick(key))
          .catch((err) => {
            console.warn(`[AIGame] JSON 加载失败: ${path}`, err);
            tick(key);
          })
      );
    }
    await Promise.all(tasks);
  }

  public getTexture(key: string): Texture | undefined {
    return this.textures.get(key);
  }

  public getJson<T>(key: string): T | undefined {
    return this.json.get(key) as T | undefined;
  }

  public loadTexture(url: string, key = url): Promise<Texture> {
    const cached = this.textures.get(key);
    if (cached) {
      return Promise.resolve(cached);
    }
    const pending = this.inflight.get(`tex:${key}`);
    if (pending) {
      return pending as Promise<Texture>;
    }
    const task = new Promise<Texture>((resolve, reject) => {
      this.textureLoader.load(
        url,
        (texture) => {
          this.textures.set(key, texture);
          this.inflight.delete(`tex:${key}`);
          resolve(texture);
        },
        undefined,
        (err) => {
          this.inflight.delete(`tex:${key}`);
          reject(err);
        }
      );
    });
    this.inflight.set(`tex:${key}`, task);
    return task;
  }

  public async loadJson<T>(url: string, key = url): Promise<T> {
    const cached = this.json.get(key);
    if (cached !== undefined) {
      return cached as T;
    }
    const pending = this.inflight.get(`json:${key}`);
    if (pending) {
      return pending as Promise<T>;
    }
    const task = (async () => {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to load ${url}: ${response.status}`);
      }
      const data = (await response.json()) as T;
      this.json.set(key, data);
      this.inflight.delete(`json:${key}`);
      return data;
    })();
    this.inflight.set(`json:${key}`, task);
    return task;
  }
}
