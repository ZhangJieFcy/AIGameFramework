import { describe, expect, it } from "vitest";
import { SaveSystem } from "../SaveSystem";
import type { IPlatform } from "../../platform/IPlatform";
import type { IAudioHandle } from "../../platform/IAudioHandle";

type MemPlatform = IPlatform & { stored: { value: string | null } };

function makePlatform(overrides: Partial<IPlatform> = {}): MemPlatform {
  const stored: { value: string | null } = { value: null };
  const base: IPlatform = {
    id: "web",
    init: () => {},
    now: () => Date.now(),
    save: (_key, value) => {
      stored.value = value;
      return true;
    },
    load: () => stored.value,
    share: () => {},
    playRewardAd: async () => true,
    resolveAssetUrl: (p) => p,
    createAudio: (): IAudioHandle => ({
      play: () => {},
      pause: () => {},
      stop: () => {},
      setVolume: () => {},
      setLoop: () => {},
      destroy: () => {}
    }),
    vibrate: () => {},
    ...overrides
  };
  return { ...base, stored };
}

describe("SaveSystem", () => {
  it("save 写入带版本号的格式", () => {
    const platform = makePlatform();
    const save = new SaveSystem(platform, "k");
    expect(save.save({ level: 2 })).toBe(true);
    const raw = JSON.parse(platform.stored.value ?? "{}") as { v: number; data: unknown };
    expect(raw.v).toBe(1);
    expect(raw.data).toEqual({ level: 2 });
  });

  it("load 读回新格式", () => {
    const platform = makePlatform();
    const save = new SaveSystem(platform, "k");
    save.save({ level: 2 });
    expect(save.load({ level: 0 })).toEqual({ level: 2 });
  });

  it("load 兼容旧格式（整包就是数据）", () => {
    const platform = makePlatform();
    platform.save("k", JSON.stringify({ clicks: 7 }));
    const save = new SaveSystem(platform, "k");
    expect(save.load({ clicks: 0 })).toEqual({ clicks: 7 });
  });

  it("load 无存档时返回默认值", () => {
    const platform = makePlatform();
    const save = new SaveSystem(platform, "k");
    expect(save.load({ clicks: 0 })).toEqual({ clicks: 0 });
  });

  it("load 遇到损坏 JSON 返回默认值", () => {
    const platform = makePlatform();
    platform.save("k", "{oops");
    const save = new SaveSystem(platform, "k");
    expect(save.load({ clicks: 0 })).toEqual({ clicks: 0 });
  });

  it("platform.save 抛错时 save 返回 false 且不抛异常", () => {
    const platform = makePlatform({
      save: () => {
        throw new Error("quota exceeded");
      }
    });
    const save = new SaveSystem(platform, "k");
    const err = console.warn;
    console.warn = () => {};
    try {
      expect(save.save({ level: 1 })).toBe(false);
    } finally {
      console.warn = err;
    }
  });

  it("循环引用数据 save 返回 false 且不抛异常", () => {
    const platform = makePlatform();
    const save = new SaveSystem(platform, "k");
    const circular: Record<string, unknown> = {};
    circular.self = circular;
    const err = console.warn;
    console.warn = () => {};
    try {
      expect(save.save(circular)).toBe(false);
    } finally {
      console.warn = err;
    }
  });

  it("load 中 platform 抛错时返回默认值", () => {
    const platform = makePlatform({
      load: () => {
        throw new Error("boom");
      }
    });
    const save = new SaveSystem(platform, "k");
    expect(save.load({ a: 1 })).toEqual({ a: 1 });
  });
});
