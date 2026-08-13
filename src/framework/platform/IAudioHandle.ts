/**
 * 音频句柄（框架内部用）
 *
 * 功能说明：
 * 屏蔽 Web / 微信 / 抖音播放器差异。游戏代码请用 ctx.audio，不要直接拿这个接口。
 */
export interface IAudioHandle {
  play(): void;
  pause(): void;
  stop(): void;
  setVolume(volume: number): void;
  setLoop(loop: boolean): void;
  destroy(): void;
}

export function createNoopAudio(): IAudioHandle {
  return {
    play(): void {},
    pause(): void {},
    stop(): void {},
    setVolume(_volume: number): void {},
    setLoop(_loop: boolean): void {},
    destroy(): void {}
  };
}

export function createHtmlAudioHandle(src: string, loop: boolean): IAudioHandle {
  const el = new Audio(src);
  el.loop = loop;
  el.preload = "auto";
  return {
    play(): void {
      void el.play().catch(() => {
        /* 浏览器常拦截未手势触发的自动播放，忽略即可 */
      });
    },
    pause(): void {
      el.pause();
    },
    stop(): void {
      el.pause();
      el.currentTime = 0;
    },
    setVolume(volume: number): void {
      el.volume = Math.min(1, Math.max(0, volume));
    },
    setLoop(nextLoop: boolean): void {
      el.loop = nextLoop;
    },
    destroy(): void {
      el.pause();
      el.src = "";
    }
  };
}

type InnerAudio = {
  src: string;
  loop: boolean;
  volume: number;
  play: () => void;
  pause: () => void;
  stop: () => void;
  destroy: () => void;
};

export function createInnerAudioHandle(
  create: (() => InnerAudio) | undefined,
  src: string,
  loop: boolean
): IAudioHandle {
  if (!create) {
    return createNoopAudio();
  }
  const ctx = create();
  ctx.src = src;
  ctx.loop = loop;
  return {
    play(): void {
      ctx.play();
    },
    pause(): void {
      ctx.pause();
    },
    stop(): void {
      ctx.stop();
    },
    setVolume(volume: number): void {
      ctx.volume = Math.min(1, Math.max(0, volume));
    },
    setLoop(nextLoop: boolean): void {
      ctx.loop = nextLoop;
    },
    destroy(): void {
      ctx.destroy();
    }
  };
}
