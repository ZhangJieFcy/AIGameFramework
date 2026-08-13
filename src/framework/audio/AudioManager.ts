import type { IAudioHandle } from "../platform/IAudioHandle";
import type { IPlatform } from "../platform/IPlatform";

/**
 * 音乐 / 音效
 *
 * 功能说明：
 * 背景音乐同时只播一首；音效可重叠。静音、音量、切后台暂停都在这里处理。
 * 把 mp3 放到 public/audio/ 后 register 名字，玩法里只写名字不要写路径。
 *
 * 常用：
 * ctx.audio.register("bgm", "/audio/bgm.mp3", { loop: true })
 * ctx.audio.register("click", "/audio/click.mp3")
 * ctx.audio.playBgm("bgm")
 * ctx.audio.playSfx("click")
 * ctx.audio.setMuted(true)
 * ctx.audio.setBgmVolume(0.5)
 *
 * 注意：浏览器必须先有一次点击才能出声。示例里第一次点击会尝试播。
 */
export class AudioManager {
  private readonly clips = new Map<string, { src: string; loop: boolean }>();
  private readonly sfxHandles = new Map<string, IAudioHandle>();
  private bgm: IAudioHandle | null = null;
  private bgmName: string | null = null;
  private muted = false;
  private bgmVolume = 0.6;
  private sfxVolume = 1;

  constructor(private readonly platform: IPlatform) {}

  public register(name: string, path: string, options?: { loop?: boolean }): void {
    this.clips.set(name, {
      src: this.platform.resolveAssetUrl(path),
      loop: options?.loop ?? false
    });
  }

  public playBgm(name: string): void {
    const clip = this.clips.get(name);
    if (!clip) {
      return;
    }
    if (this.bgmName === name && this.bgm) {
      if (!this.muted) {
        this.bgm.play();
      }
      return;
    }
    this.bgm?.destroy();
    this.bgm = this.platform.createAudio(clip.src, true);
    this.bgm.setLoop(true);
    this.bgm.setVolume(this.muted ? 0 : this.bgmVolume);
    this.bgmName = name;
    if (!this.muted) {
      this.bgm.play();
    }
  }

  public stopBgm(): void {
    this.bgm?.stop();
  }

  public playSfx(name: string): void {
    if (this.muted) {
      return;
    }
    const clip = this.clips.get(name);
    if (!clip) {
      return;
    }
    let handle = this.sfxHandles.get(name);
    if (!handle) {
      handle = this.platform.createAudio(clip.src, false);
      this.sfxHandles.set(name, handle);
    }
    handle.setVolume(this.sfxVolume);
    handle.stop();
    handle.play();
  }

  public setMuted(muted: boolean): void {
    this.muted = muted;
    this.bgm?.setVolume(muted ? 0 : this.bgmVolume);
    if (muted) {
      this.bgm?.pause();
    } else if (this.bgmName) {
      this.bgm?.play();
    }
  }

  public isMuted(): boolean {
    return this.muted;
  }

  public setBgmVolume(volume: number): void {
    this.bgmVolume = Math.min(1, Math.max(0, volume));
    if (!this.muted) {
      this.bgm?.setVolume(this.bgmVolume);
    }
  }

  public setSfxVolume(volume: number): void {
    this.sfxVolume = Math.min(1, Math.max(0, volume));
  }

  public pauseAll(): void {
    this.bgm?.pause();
  }

  public resumeBgm(): void {
    if (!this.muted && this.bgmName) {
      this.bgm?.play();
    }
  }
}
