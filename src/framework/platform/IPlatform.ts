export interface IPlatform {
  readonly id: "web" | "wechat" | "douyin";
  init(): void;
  now(): number;
  save(key: string, value: string): boolean;
  load(key: string): string | null;
  share(message: string): void;
  playRewardAd(placementId: string): Promise<boolean>;
}
