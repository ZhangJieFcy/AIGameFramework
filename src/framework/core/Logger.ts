/**
 * 日志
 *
 * 功能说明：
 * 统一打印，正式包可关掉。比直接 console.log 更好找。
 *
 * 常用：
 * ctx.log.info("开始游戏")
 * ctx.log.warn("缺资源", url)
 * ctx.log.error("失败", err)
 * ctx.log.enabled = false   // 关掉所有日志
 */
export class Logger {
  public enabled = true;

  public info(...args: unknown[]): void {
    if (this.enabled) {
      console.info("[AIGame]", ...args);
    }
  }

  public warn(...args: unknown[]): void {
    if (this.enabled) {
      console.warn("[AIGame]", ...args);
    }
  }

  public error(...args: unknown[]): void {
    if (this.enabled) {
      console.error("[AIGame]", ...args);
    }
  }
}
