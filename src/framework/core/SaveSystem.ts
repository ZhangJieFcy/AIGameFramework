import { IPlatform } from "../platform/IPlatform";

export class SaveSystem<T = unknown> {
  constructor(
    private readonly platform: IPlatform,
    private readonly saveKey: string
  ) {}

  public load(defaultValue: T): T {
    const raw = this.platform.load(this.saveKey);
    if (!raw) {
      return defaultValue;
    }
    try {
      return JSON.parse(raw) as T;
    } catch {
      return defaultValue;
    }
  }

  public save(data: T): boolean {
    return this.platform.save(this.saveKey, JSON.stringify(data));
  }
}
