import type { IAudioHandle } from "./IAudioHandle";

/**
 * 平台适配（Web / 微信小游戏 / 抖音小游戏）
 *
 * 功能说明：
 * 存档、分享、广告、音频、震动等和「运行在哪」有关的能力，都走这里。
 * 游戏里请用 ctx.platform，不要写 wx / tt。
 *
 * 常用：
 * - ctx.platform.id            当前端：web / wechat / douyin
 * - ctx.platform.save/load     字符串存档（一般改用 ctx.save）
 * - ctx.platform.share("标题")
 * - ctx.platform.vibrate()     短震
 * - ctx.platform.playRewardAd("广告位id")
 */
export interface IPlatform {
  readonly id: "web" | "wechat" | "douyin";
  init(): void;
  now(): number;
  save(key: string, value: string): boolean;
  load(key: string): string | null;
  share(message: string): void;
  playRewardAd(placementId: string): Promise<boolean>;
  /** 把 /audio/x.mp3 转成当前端能加载的路径 */
  resolveAssetUrl(path: string): string;
  createAudio(src: string, loop?: boolean): IAudioHandle;
  vibrate(durationMs?: number): void;
}
