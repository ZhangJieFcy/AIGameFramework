import { IPlatform } from "../IPlatform";
import { resolveStorage } from "../storage";

type WechatLike = {
  setStorageSync?: (key: string, value: string) => void;
  getStorageSync?: (key: string) => string;
  shareAppMessage?: (payload: { title: string }) => void;
};

declare global {
  interface Window {
    wx?: WechatLike;
  }
}

export class WechatPlatform implements IPlatform {
  public readonly id = "wechat" as const;

  public init(): void {
    console.info("wechat platform init");
  }

  public now(): number {
    return Date.now();
  }

  public save(key: string, value: string): boolean {
    const wx = window.wx;
    if (wx?.setStorageSync) {
      wx.setStorageSync(key, value);
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
    const wx = window.wx;
    if (wx?.getStorageSync) {
      return wx.getStorageSync(key) ?? null;
    }
    return resolveStorage()?.getItem(key) ?? null;
  }

  public share(message: string): void {
    window.wx?.shareAppMessage?.({ title: message });
  }

  public async playRewardAd(_placementId: string): Promise<boolean> {
    return Promise.resolve(false);
  }
}
