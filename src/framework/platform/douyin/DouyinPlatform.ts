import { IPlatform } from "../IPlatform";
import { createInnerAudioHandle, type IAudioHandle } from "../IAudioHandle";
import { resolveStorage } from "../storage";

type DouyinLike = {
  setStorageSync?: (key: string, value: string) => void;
  getStorageSync?: (key: string) => string;
  shareAppMessage?: (payload: { title: string }) => void;
  vibrateShort?: (opts?: { type?: string }) => void;
  vibrateLong?: () => void;
  createInnerAudioContext?: () => {
    src: string;
    loop: boolean;
    volume: number;
    play: () => void;
    pause: () => void;
    stop: () => void;
    destroy: () => void;
  };
};

declare global {
  interface Window {
    tt?: DouyinLike;
  }
}

export class DouyinPlatform implements IPlatform {
  public readonly id = "douyin" as const;

  public init(): void {
    console.info("douyin platform init");
  }

  public now(): number {
    return Date.now();
  }

  public save(key: string, value: string): boolean {
    const tt = window.tt;
    if (tt?.setStorageSync) {
      try {
        tt.setStorageSync(key, value);
        return true;
      } catch {
        return false;
      }
    }
    const storage = resolveStorage();
    if (!storage?.setItem) {
      return false;
    }
    try {
      storage.setItem(key, value);
      return true;
    } catch {
      return false;
    }
  }

  public load(key: string): string | null {
    const tt = window.tt;
    if (tt?.getStorageSync) {
      return tt.getStorageSync(key) ?? null;
    }
    return resolveStorage()?.getItem(key) ?? null;
  }

  public share(message: string): void {
    window.tt?.shareAppMessage?.({ title: message });
  }

  public async playRewardAd(_placementId: string): Promise<boolean> {
    return Promise.resolve(false);
  }

  public resolveAssetUrl(path: string): string {
    return path.replace(/^\.\//, "").replace(/^\//, "");
  }

  public createAudio(src: string, loop = false): IAudioHandle {
    return createInnerAudioHandle(window.tt?.createInnerAudioContext, src, loop);
  }

  public vibrate(durationMs = 15): void {
    if (durationMs >= 400) {
      window.tt?.vibrateLong?.();
      return;
    }
    window.tt?.vibrateShort?.({ type: "light" });
  }
}
