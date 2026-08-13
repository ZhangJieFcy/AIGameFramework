import { IPlatform } from "../IPlatform";
import { createHtmlAudioHandle, type IAudioHandle } from "../IAudioHandle";
import { resolveStorage } from "../storage";

export class WebPlatform implements IPlatform {
  public readonly id = "web" as const;

  public init(): void {}

  public now(): number {
    return Date.now();
  }

  public save(key: string, value: string): boolean {
    const storage = resolveStorage();
    if (!storage?.setItem) {
      return false;
    }
    try {
      // 隐私模式 / 存满时 localStorage.setItem 会抛错，不能让它炸掉存档流程
      storage.setItem(key, value);
      return true;
    } catch {
      return false;
    }
  }

  public load(key: string): string | null {
    const storage = resolveStorage();
    if (!storage?.getItem) {
      return null;
    }
    return storage.getItem(key);
  }

  public share(message: string): void {
    console.info("web share:", message);
  }

  public async playRewardAd(_placementId: string): Promise<boolean> {
    return Promise.resolve(true);
  }

  public resolveAssetUrl(path: string): string {
    return path;
  }

  public createAudio(src: string, loop = false): IAudioHandle {
    return createHtmlAudioHandle(src, loop);
  }

  public vibrate(durationMs = 15): void {
    const nav = navigator as Navigator & { vibrate?: (pattern: number) => boolean };
    nav.vibrate?.(durationMs);
  }
}
