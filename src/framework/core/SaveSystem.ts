import { IPlatform } from "../platform/IPlatform";

/**
 * 存档
 *
 * 功能说明：
 * 把对象转成 JSON 存到当前平台（浏览器 localStorage / 微信、抖音本地存储）。
 * 切后台、关页面时框架会自动调用游戏的 save()。
 *
 * 常用：
 * ctx.save.save({ level: 2, coin: 30 })
 * const data = ctx.save.load({ level: 1, coin: 0 })
 */
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
    try {
      // JSON.stringify 对循环引用会抛错；平台存储（隐私模式/存满）也可能抛错，统一兜住
      return this.platform.save(this.saveKey, JSON.stringify(data));
    } catch (err) {
      console.warn("[AIGame] 存档写入失败", err);
      return false;
    }
  }
}
