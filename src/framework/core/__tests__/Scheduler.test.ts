import { describe, expect, it } from "vitest";
import { Scheduler } from "../Scheduler";

describe("Scheduler", () => {
  it("delay 到期只触发一次", () => {
    const s = new Scheduler();
    let count = 0;
    s.delay(1, () => (count += 1));
    s.update(0.5);
    expect(count).toBe(0);
    s.update(0.6);
    expect(count).toBe(1);
    s.update(1);
    expect(count).toBe(1);
  });

  it("interval 按周期重复触发", () => {
    const s = new Scheduler();
    let count = 0;
    s.interval(0.5, () => (count += 1));
    s.update(0.5);
    s.update(0.5);
    s.update(0.5);
    expect(count).toBe(3);
  });

  it("cancel 后不再触发", () => {
    const s = new Scheduler();
    let count = 0;
    const id = s.delay(0.1, () => (count += 1));
    s.cancel(id);
    s.update(1);
    expect(count).toBe(0);
  });

  it("cancelAll 清空所有定时器", () => {
    const s = new Scheduler();
    let a = 0;
    let b = 0;
    s.delay(0.1, () => (a += 1));
    s.interval(0.1, () => (b += 1));
    s.cancelAll();
    s.update(1);
    expect(a).toBe(0);
    expect(b).toBe(0);
  });

  it("pause 暂停、resume 恢复", () => {
    const s = new Scheduler();
    let count = 0;
    s.interval(0.5, () => (count += 1));
    s.pause();
    s.update(1);
    expect(count).toBe(0);
    s.resume();
    s.update(0.5);
    expect(count).toBe(1);
  });

  it("负数秒按 0 处理，不抛错", () => {
    const s = new Scheduler();
    let count = 0;
    s.delay(-1, () => (count += 1));
    s.update(0.016);
    expect(count).toBe(1);
  });
});
