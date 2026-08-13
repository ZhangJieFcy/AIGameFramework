import { describe, expect, it } from "vitest";
import { Pool } from "../Pool";

type Dummy = { active: boolean; tag: string };

function makePool(): Pool {
  const pool = new Pool();
  pool.register<Dummy>(
    "dummy",
    () => ({ active: true, tag: "new" }),
    (obj) => {
      obj.active = false;
      obj.tag = "reset";
    }
  );
  return pool;
}

describe("Pool", () => {
  it("未注册的 key 抛错", () => {
    const pool = new Pool();
    expect(() => pool.acquire("nope")).toThrow();
    expect(() => pool.release("nope", {})).toThrow();
  });

  it("无 warmup 时 acquire 每次新建", () => {
    const pool = makePool();
    const a = pool.acquire<Dummy>("dummy");
    const b = pool.acquire<Dummy>("dummy");
    expect(a).not.toBe(b);
    expect(a.active).toBe(true);
  });

  it("warmup 预建对象，acquire 复用", () => {
    const pool = makePool();
    pool.warmup("dummy", 3);
    const first = pool.acquire<Dummy>("dummy");
    // warmup 时已 reset，取出来时 free 里是 reset 过的对象
    expect(first.tag).toBe("reset");
    pool.acquire<Dummy>("dummy");
    pool.acquire<Dummy>("dummy");
    expect(pool.stats("dummy").free).toBe(0);
  });

  it("release 调用 reset 并归还", () => {
    const pool = makePool();
    const obj = pool.acquire<Dummy>("dummy");
    pool.release("dummy", obj);
    expect(obj.active).toBe(false);
    expect(obj.tag).toBe("reset");
    expect(pool.stats("dummy").live).toBe(0);
    expect(pool.stats("dummy").free).toBe(1);
  });

  it("重复 release 同一对象被忽略", () => {
    const pool = makePool();
    const obj = pool.acquire<Dummy>("dummy");
    pool.release("dummy", obj);
    pool.release("dummy", obj);
    expect(pool.stats("dummy").free).toBe(1);
  });

  it("live 计数不为负", () => {
    const pool = makePool();
    const obj = pool.acquire<Dummy>("dummy");
    pool.release("dummy", obj);
    pool.release("dummy", obj);
    expect(pool.stats("dummy").live).toBe(0);
  });

  it("clear(key) 只清指定池", () => {
    const pool = makePool();
    pool.register("other", () => 1);
    pool.clear("dummy");
    expect(() => pool.acquire("dummy")).toThrow();
    expect(pool.acquire<number>("other")).toBe(1);
  });
});
