import { IPlatform } from "../IPlatform";
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
    storage.setItem(key, value);
    return true;
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
}
