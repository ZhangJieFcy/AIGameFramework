type TimerKind = "delay" | "interval";

type Timer = {
  id: number;
  kind: TimerKind;
  remain: number;
  interval: number;
  fn: () => void;
};

/**
 * 定时器
 *
 * 功能说明：
 * 延迟执行、循环执行。切到后台会自动暂停（和游戏暂停一起）。
 *
 * 常用：
 * const id = ctx.scheduler.delay(1, () => { ... })     // 1 秒后做一次
 * const id2 = ctx.scheduler.interval(0.5, () => { ... }) // 每 0.5 秒
 * ctx.scheduler.cancel(id)
 * ctx.scheduler.cancelAll()
 */
export class Scheduler {
  private nextId = 1;
  private readonly timers: Timer[] = [];
  private paused = false;

  public delay(seconds: number, fn: () => void): number {
    return this.add("delay", seconds, fn);
  }

  public interval(seconds: number, fn: () => void): number {
    return this.add("interval", seconds, fn);
  }

  public cancel(id: number): void {
    const index = this.timers.findIndex((t) => t.id === id);
    if (index >= 0) {
      this.timers.splice(index, 1);
    }
  }

  public cancelAll(): void {
    this.timers.length = 0;
  }

  public pause(): void {
    this.paused = true;
  }

  public resume(): void {
    this.paused = false;
  }

  public update(dt: number): void {
    if (this.paused) {
      return;
    }
    for (let i = this.timers.length - 1; i >= 0; i -= 1) {
      const timer = this.timers[i];
      if (!timer) {
        continue;
      }
      timer.remain -= dt;
      if (timer.remain > 0) {
        continue;
      }
      timer.fn();
      if (timer.kind === "delay") {
        this.timers.splice(i, 1);
      } else {
        timer.remain += timer.interval;
      }
    }
  }

  private add(kind: TimerKind, seconds: number, fn: () => void): number {
    const id = this.nextId;
    this.nextId += 1;
    this.timers.push({
      id,
      kind,
      remain: Math.max(0, seconds),
      interval: Math.max(0.016, seconds),
      fn
    });
    return id;
  }
}
