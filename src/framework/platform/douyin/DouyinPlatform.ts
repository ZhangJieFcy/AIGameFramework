import { IPlatform } from "../IPlatform";
import { resolveStorage } from "../storage";

type DouyinLike = {
  setStorageSync?: (key: string, value: string) => void;
  getStorageSync?: (key: string) => string;
  shareAppMessage?: (payload: { title: string }) => void;
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
      tt.setStorageSync(key, value);
      return true;
    }
    const storage = resolveStorage();
    if (!storage?.setItem) {
      return false;
    }
    storage.setItem(key, value);
    return true;
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
}
