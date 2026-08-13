export type EaseName = "linear" | "quadIn" | "quadOut";

export type TweenOptions = {
  /** 秒 */
  duration: number;
  from: number;
  to: number;
  delay?: number;
  ease?: EaseName;
  onUpdate?: (value: number) => void;
  onComplete?: () => void;
};

type TweenItem = {
  id: number;
  elapsed: number;
  delay: number;
  duration: number;
  from: number;
  to: number;
  ease: EaseName;
  onUpdate?: (value: number) => void;
  onComplete?: () => void;
};

/**
 * 缓动 / 补间动画
 *
 * 功能说明：
 * 把一个数字在若干秒内从 A 变到 B，用来做弹出、淡入、相机移动等。
 *
 * 常用：
 * ctx.tween.start({
 *   from: 0, to: 1, duration: 0.35, ease: "quadOut",
 *   onUpdate: (v) => { cube.scale.setScalar(v) },
 *   onComplete: () => {}
 * })
 * ctx.tween.killAll()
 */
export class Tween {
  private nextId = 1;
  private readonly items: TweenItem[] = [];

  public start(options: TweenOptions): number {
    const id = this.nextId;
    this.nextId += 1;
    this.items.push({
      id,
      elapsed: 0,
      delay: options.delay ?? 0,
      duration: Math.max(0.0001, options.duration),
      from: options.from,
      to: options.to,
      ease: options.ease ?? "linear",
      onUpdate: options.onUpdate,
      onComplete: options.onComplete
    });
    return id;
  }

  public kill(id: number): void {
    const index = this.items.findIndex((t) => t.id === id);
    if (index >= 0) {
      this.items.splice(index, 1);
    }
  }

  public killAll(): void {
    this.items.length = 0;
  }

  public update(dt: number): void {
    for (let i = this.items.length - 1; i >= 0; i -= 1) {
      const item = this.items[i];
      if (!item) {
        continue;
      }
      if (item.delay > 0) {
        item.delay -= dt;
        continue;
      }
      item.elapsed += dt;
      const t = Math.min(1, item.elapsed / item.duration);
      const k = ease(item.ease, t);
      const value = item.from + (item.to - item.from) * k;
      item.onUpdate?.(value);
      if (t >= 1) {
        item.onComplete?.();
        this.items.splice(i, 1);
      }
    }
  }
}

function ease(name: EaseName, t: number): number {
  if (name === "quadIn") {
    return t * t;
  }
  if (name === "quadOut") {
    return 1 - (1 - t) * (1 - t);
  }
  return t;
}
