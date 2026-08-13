import { IPlatform } from "../platform/IPlatform";
import { DouyinPlatform } from "../platform/douyin/DouyinPlatform";
import { WebPlatform } from "../platform/web/WebPlatform";
import { WechatPlatform } from "../platform/wechat/WechatPlatform";

export function createPlatform(): IPlatform {
  const g = globalThis as { wx?: unknown; tt?: unknown };
  if (typeof g.wx !== "undefined") {
    return new WechatPlatform();
  }
  if (typeof g.tt !== "undefined") {
    return new DouyinPlatform();
  }
  return new WebPlatform();
}
