/**
 * 屏幕尺寸
 *
 * 功能说明：
 * 当前画布宽高、像素比、横竖屏。做 UI 适配时用这些数。
 *
 * 常用：
 * ctx.screen.width / height
 * ctx.screen.dpr
 * ctx.screen.isPortrait   是否竖屏
 */
export class Screen {
  public width = 720;
  public height = 1280;
  public dpr = 1;

  constructor(private readonly mount: HTMLElement) {
    this.refresh();
  }

  public get isPortrait(): boolean {
    return this.height >= this.width;
  }

  public refresh(): void {
    this.width = this.mount.clientWidth || window.innerWidth || 720;
    this.height = this.mount.clientHeight || window.innerHeight || 1280;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
  }
}
