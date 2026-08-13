import { IPlatform } from "../platform/IPlatform";

/**
 * 存档
 *
 * 功能说明：
 * 把对象转成 JSON 存到当前平台（浏览器 localStorage / 微信、抖音本地存储）。
 * 存档自带版本号 { v, data }：以后改存档结构时，把 VERSION 加一并在 load 里做迁移，
 * 老玩家旧格式的存档也能自动兼容读取。
 * 切后台、关页面时框架会自动调用游戏的 save()。
 *
 * 常用：
 * ctx.save.save({ level: 2, coin: 30 })
 * const data = ctx.save.load({ level: 1, coin: 0 })
 */
export class SaveSystem<T = unknown> {
  /** 存档格式版本。修改存档结构时 +1，并在 load 里处理旧版本迁移。 */
  private static readonly VERSION = 1;

  constructor(
    private readonly platform: IPlatform,
    private readonly saveKey: string
  ) {}

  public load(defaultValue: T): T {
    try {
      const raw = this.platform.load(this.saveKey);
      if (!raw) {
        return defaultValue;
      }
      const parsed = JSON.parse(raw) as { v?: number; data?: T };
      if (parsed && typeof parsed === "object" && "data" in parsed) {
        // 新格式 { v, data }：以后版本升级在这里按 v 迁移
        return (parsed as { data: T }).data;
      }
      // 旧格式：整包就是数据本身（兼容历史存档）
      return parsed as T;
    } catch {
      // 平台读取抛错 / JSON 损坏都按无存档处理
      return defaultValue;
    }
  }

  public save(data: T): boolean {
    try {
      // JSON.stringify 对循环引用会抛错；平台存储（隐私模式/存满）也可能抛错，统一兜住
      return this.platform.save(this.saveKey, JSON.stringify({ v: SaveSystem.VERSION, data }));
    } catch (err) {
      console.warn("[AIGame] 存档写入失败", err);
      return false;
    }
  }
}
