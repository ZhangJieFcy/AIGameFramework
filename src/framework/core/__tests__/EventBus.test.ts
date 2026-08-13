import { describe, expect, it } from "vitest";
import { EventBus } from "../EventBus";

type Events = { "game:score": number } & Record<string, unknown>;

describe("EventBus", () => {
  it("on + emit 按顺序派发负载", () => {
    const bus = new EventBus<Events>();
    const got: number[] = [];
    bus.on("game:score", (n) => got.push(n));
    bus.emit("game:score", 10);
    bus.emit("game:score", 20);
    expect(got).toEqual([10, 20]);
  });

  it("off 取消监听", () => {
    const bus = new EventBus<Events>();
    let count = 0;
    const off = bus.on("game:score", () => (count += 1));
    off();
    bus.emit("game:score", 1);
    expect(count).toBe(0);
  });

  it("once 只触发一次", () => {
    const bus = new EventBus<Events>();
    let count = 0;
    bus.once("game:score", () => (count += 1));
    bus.emit("game:score", 1);
    bus.emit("game:score", 2);
    expect(count).toBe(1);
  });

  it("emit 期间新增/删除监听器不影响本次派发", () => {
    const bus = new EventBus<Events>();
    const order: string[] = [];
    bus.on("game:score", () => order.push("a"));
    bus.on("game:score", () => {
      order.push("b");
      bus.on("game:score", () => order.push("late"));
    });
    bus.emit("game:score", 1);
    expect(order).toEqual(["a", "b"]);
  });

  it("单个监听器抛错不影响其他监听器，emit 不抛异常", () => {
    const bus = new EventBus<Events>();
    const err = console.error;
    console.error = () => {};
    try {
      const got: number[] = [];
      bus.on("game:score", () => {
        throw new Error("boom");
      });
      bus.on("game:score", (n) => got.push(n));
      expect(() => bus.emit("game:score", 5)).not.toThrow();
      expect(got).toEqual([5]);
    } finally {
      console.error = err;
    }
  });

  it("无监听器时 emit 安全", () => {
    const bus = new EventBus<Events>();
    expect(() => bus.emit("game:score", 1)).not.toThrow();
  });
});
