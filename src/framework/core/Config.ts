/**
 * 配置表
 *
 * 功能说明：
 * 读取 public/config/game.json。数值尽量写在 JSON 里，少写死在代码中。
 *
 * 常用：
 * await ctx.config.load("/config/game.json")  // 启动时框架已自动加载
 * ctx.config.get("gameName", "未命名")
 * ctx.config.getNumber("targetFps", 60)
 * ctx.config.all()
 */
export class Config {
  private data: Record<string, unknown> = {};

  public async load(url = "/config/game.json"): Promise<void> {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`配置加载失败 ${url}: ${response.status}`);
    }
    this.data = (await response.json()) as Record<string, unknown>;
  }

  public all(): Record<string, unknown> {
    return this.data;
  }

  public get<T>(key: string, fallback: T): T {
    const value = this.data[key];
    return (value as T) ?? fallback;
  }

  public getNumber(key: string, fallback: number): number {
    const value = this.data[key];
    return typeof value === "number" && Number.isFinite(value) ? value : fallback;
  }

  public getString(key: string, fallback: string): string {
    const value = this.data[key];
    return typeof value === "string" ? value : fallback;
  }

  public getBoolean(key: string, fallback: boolean): boolean {
    const value = this.data[key];
    return typeof value === "boolean" ? value : fallback;
  }
}
