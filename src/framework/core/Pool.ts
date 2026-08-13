type PoolBucket<T> = {
  factory: () => T;
  reset?: (obj: T) => void;
  free: T[];
  live: number;
};

/**
 * 对象池
 *
 * 功能说明：
 * 反复创建/销毁子弹、伤害数字会卡顿。池子先造好，用的时候取出，用完还回去。
 *
 * 常用：
 * ctx.pool.register("bullet", () => new Mesh(...), (m) => { m.visible = false })
 * ctx.pool.warmup("bullet", 20)
 * const bullet = ctx.pool.acquire<Mesh>("bullet")
 * ctx.pool.release("bullet", bullet)
 */
export class Pool {
  private readonly buckets = new Map<string, PoolBucket<unknown>>();

  public register<T>(key: string, factory: () => T, reset?: (obj: T) => void): void {
    this.buckets.set(key, {
      factory,
      reset: reset as ((obj: unknown) => void) | undefined,
      free: [],
      live: 0
    });
  }

  public warmup(key: string, count: number): void {
    const bucket = this.must(key);
    for (let i = 0; i < count; i += 1) {
      const obj = bucket.factory();
      bucket.reset?.(obj);
      bucket.free.push(obj);
    }
  }

  public acquire<T>(key: string): T {
    const bucket = this.must(key);
    const obj = (bucket.free.pop() ?? bucket.factory()) as T;
    bucket.live += 1;
    return obj;
  }

  public release<T>(key: string, obj: T): void {
    const bucket = this.must(key);
    if (bucket.free.includes(obj as unknown)) {
      // 重复归还：忽略，避免同一个对象被放进 free 两次、又被取出两次
      return;
    }
    bucket.reset?.(obj);
    bucket.free.push(obj);
    bucket.live = Math.max(0, bucket.live - 1);
  }

  public stats(key: string): { free: number; live: number } {
    const bucket = this.must(key);
    return { free: bucket.free.length, live: bucket.live };
  }

  public clear(key?: string): void {
    if (key) {
      this.buckets.delete(key);
      return;
    }
    this.buckets.clear();
  }

  private must(key: string): PoolBucket<unknown> {
    const bucket = this.buckets.get(key);
    if (!bucket) {
      throw new Error(`对象池没有注册: ${key}，请先 ctx.pool.register`);
    }
    return bucket;
  }
}
