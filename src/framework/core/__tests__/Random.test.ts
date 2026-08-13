import { describe, expect, it } from "vitest";
import { Random } from "../Random";

describe("Random", () => {
  it("相同种子产生相同序列（可复现）", () => {
    const a = new Random();
    const b = new Random();
    a.seed(12345);
    b.seed(12345);
    const seqA = [a.float(), a.float(), a.float()];
    const seqB = [b.float(), b.float(), b.float()];
    expect(seqA).toEqual(seqB);
  });

  it("float 落在 [min, max) 内", () => {
    const rng = new Random();
    for (let i = 0; i < 1000; i += 1) {
      const v = rng.float(-2, 3);
      expect(v).toBeGreaterThanOrEqual(-2);
      expect(v).toBeLessThan(3);
    }
  });

  it("int 落在闭区间内", () => {
    const rng = new Random();
    for (let i = 0; i < 1000; i += 1) {
      const v = rng.int(1, 6);
      expect(v).toBeGreaterThanOrEqual(1);
      expect(v).toBeLessThanOrEqual(6);
      expect(Number.isInteger(v)).toBe(true);
    }
  });

  it("pick 返回数组内元素", () => {
    const rng = new Random();
    const list = ["a", "b", "c"];
    for (let i = 0; i < 100; i += 1) {
      expect(list).toContain(rng.pick(list));
    }
  });

  it("pick 空数组抛错", () => {
    const rng = new Random();
    expect(() => rng.pick([])).toThrow();
  });

  it("shuffle 保持元素集合不变", () => {
    const rng = new Random();
    const list = [1, 2, 3, 4, 5];
    const sorted = [...list].sort();
    rng.shuffle(list);
    expect([...list].sort()).toEqual(sorted);
  });

  it("chance(1) 恒真、chance(0) 恒假", () => {
    const rng = new Random();
    for (let i = 0; i < 100; i += 1) {
      expect(rng.chance(1)).toBe(true);
      expect(rng.chance(0)).toBe(false);
    }
  });
});
