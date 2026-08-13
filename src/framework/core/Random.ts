/**
 * 随机数
 *
 * 功能说明：
 * 取整数、小数、从数组里抽一个。可设种子，方便复现同一关。
 *
 * 常用：
 * ctx.rng.int(1, 6)           骰子 1~6
 * ctx.rng.float(0, 1)
 * ctx.rng.pick(["红", "蓝"])
 * ctx.rng.chance(0.3)         30% 为 true
 * ctx.rng.seed(12345)         固定随机序列
 */
export class Random {
  private state = 123456789;

  public seed(value: number): void {
    this.state = value >>> 0 || 1;
  }

  public float(min = 0, max = 1): number {
    this.state = (Math.imul(1664525, this.state) + 1013904223) >>> 0;
    const n = this.state / 0x100000000;
    return min + (max - min) * n;
  }

  public int(min: number, max: number): number {
    const lo = Math.ceil(min);
    const hi = Math.floor(max);
    return lo + Math.floor(this.float(0, 1) * (hi - lo + 1));
  }

  public chance(probability: number): boolean {
    return this.float(0, 1) < probability;
  }

  public pick<T>(list: readonly T[]): T {
    if (list.length === 0) {
      throw new Error("rng.pick: 数组是空的");
    }
    return list[this.int(0, list.length - 1)] as T;
  }

  public shuffle<T>(list: T[]): T[] {
    for (let i = list.length - 1; i > 0; i -= 1) {
      const j = this.int(0, i);
      const tmp = list[i] as T;
      list[i] = list[j] as T;
      list[j] = tmp;
    }
    return list;
  }
}
