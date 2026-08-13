import { describe, expect, it } from "vitest";
import { Tween } from "../Tween";

describe("Tween", () => {
  it("linear 按进度线性取值并触发 onComplete", () => {
    const t = new Tween();
    const values: number[] = [];
    let done = 0;
    t.start({
      from: 0,
      to: 10,
      duration: 1,
      onUpdate: (v) => values.push(v),
      onComplete: () => (done += 1)
    });
    t.update(0.5);
    expect(values[values.length - 1]).toBeCloseTo(5);
    t.update(0.5);
    expect(values[values.length - 1]).toBeCloseTo(10);
    expect(done).toBe(1);
  });

  it("delay 期间不回调", () => {
    const t = new Tween();
    const values: number[] = [];
    t.start({ from: 0, to: 1, duration: 1, delay: 0.5, onUpdate: (v) => values.push(v) });
    t.update(0.5);
    expect(values.length).toBe(0);
    t.update(0.5);
    expect(values[values.length - 1]).toBeCloseTo(0.5);
  });

  it("quadOut 在 t=0.5 时取 0.75", () => {
    const t = new Tween();
    let v = 0;
    t.start({ from: 0, to: 1, duration: 1, ease: "quadOut", onUpdate: (x) => (v = x) });
    t.update(0.5);
    expect(v).toBeCloseTo(0.75);
  });

  it("kill 后不再更新", () => {
    const t = new Tween();
    let v = -1;
    const id = t.start({ from: 0, to: 1, duration: 1, onUpdate: (x) => (v = x) });
    t.kill(id);
    t.update(1);
    expect(v).toBe(-1);
  });

  it("killAll 清空全部", () => {
    const t = new Tween();
    let a = 0;
    let b = 0;
    t.start({ from: 0, to: 1, duration: 1, onUpdate: () => (a += 1) });
    t.start({ from: 0, to: 1, duration: 1, onUpdate: () => (b += 1) });
    t.killAll();
    t.update(1);
    expect(a).toBe(0);
    expect(b).toBe(0);
  });
});
