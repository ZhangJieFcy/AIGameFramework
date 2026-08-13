export type PointerInfo = {
  x: number;
  y: number;
  down: boolean;
};

/**
 * 输入（点击 / 触摸 / 键盘）
 *
 * 功能说明：
 * 统一指针和键盘。UI 面板上的点击不会算作游戏点击（带 data-ui 的节点会被忽略）。
 *
 * 常用：
 * ctx.input.pointer.x / y / down
 * ctx.input.justTapped          本帧是否点了一下（游戏区域）
 * ctx.input.onTap(() => { ... })
 * ctx.input.keyDown("Space")    仅 Web 有效
 */
export class InputManager {
  public readonly pointer: PointerInfo = { x: 0, y: 0, down: false };
  public justTapped = false;
  public justReleased = false;

  private readonly keys = new Set<string>();
  private readonly tapHandlers = new Set<() => void>();
  /** 缓存 mount 位置，避免每次 pointermove 都触发布局读取；resize 时失效重算 */
  private rect: DOMRect | null = null;
  private readonly onPointerDown = (event: PointerEvent): void => this.handleDown(event);
  private readonly onPointerUp = (event: PointerEvent): void => this.handleUp(event);
  private readonly onPointerMove = (event: PointerEvent): void => this.handleMove(event);
  private readonly onKeyDown = (event: KeyboardEvent): void => {
    this.keys.add(event.code);
  };
  private readonly onKeyUp = (event: KeyboardEvent): void => {
    this.keys.delete(event.code);
  };
  private readonly onResize = (): void => {
    this.rect = null;
  };

  constructor(private readonly mount: HTMLElement) {
    mount.addEventListener("pointerdown", this.onPointerDown);
    // up/cancel 挂 window：在画布外松开也能正确复位，避免 pointer.down 卡住
    window.addEventListener("pointerup", this.onPointerUp);
    window.addEventListener("pointercancel", this.onPointerUp);
    window.addEventListener("pointermove", this.onPointerMove);
    window.addEventListener("resize", this.onResize);
    window.addEventListener("keydown", this.onKeyDown);
    window.addEventListener("keyup", this.onKeyUp);
  }

  public onTap(handler: () => void): () => void {
    this.tapHandlers.add(handler);
    return () => this.tapHandlers.delete(handler);
  }

  public keyDown(code: string): boolean {
    return this.keys.has(code);
  }

  public endFrame(): void {
    this.justTapped = false;
    this.justReleased = false;
  }

  public dispose(): void {
    this.mount.removeEventListener("pointerdown", this.onPointerDown);
    window.removeEventListener("pointerup", this.onPointerUp);
    window.removeEventListener("pointercancel", this.onPointerUp);
    window.removeEventListener("pointermove", this.onPointerMove);
    window.removeEventListener("resize", this.onResize);
    window.removeEventListener("keydown", this.onKeyDown);
    window.removeEventListener("keyup", this.onKeyUp);
  }

  private isUi(target: EventTarget | null): boolean {
    return target instanceof HTMLElement && Boolean(target.closest("[data-ui]"));
  }

  private handleMove(event: PointerEvent): void {
    const rect = (this.rect ??= this.mount.getBoundingClientRect());
    this.pointer.x = event.clientX - rect.left;
    this.pointer.y = event.clientY - rect.top;
  }

  private handleDown(event: PointerEvent): void {
    this.handleMove(event);
    if (this.isUi(event.target)) {
      return;
    }
    this.pointer.down = true;
    this.justTapped = true;
    for (const handler of this.tapHandlers) {
      handler();
    }
  }

  private handleUp(event: PointerEvent): void {
    this.handleMove(event);
    if (!this.pointer.down) {
      return;
    }
    this.pointer.down = false;
    this.justReleased = true;
  }
}
