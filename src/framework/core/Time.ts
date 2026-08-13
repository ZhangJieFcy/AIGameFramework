/**
 * 时间
 *
 * 功能说明：
 * 每帧算出间隔秒数 dt，供移动、旋转、定时器使用。单帧最长按 0.1 秒算，避免切后台回来瞬移。
 *
 * 常用：
 * 游戏 update(dt) 里的 dt 就是它；也可读 ctx.time.deltaSeconds
 */
export class Time {
  private lastMs = performance.now();
  public deltaSeconds = 0;

  public tick(): number {
    const now = performance.now();
    this.deltaSeconds = Math.min(0.1, (now - this.lastMs) / 1000);
    this.lastMs = now;
    return this.deltaSeconds;
  }
}
