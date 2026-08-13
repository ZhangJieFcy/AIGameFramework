import type { GameContext } from "../types";
import type { IView } from "./IView";

type Layer = {
  view: IView;
  el: HTMLDivElement;
};

/**
 * 界面管理
 *
 * 功能说明：
 * 按名字打开/关闭面板，支持叠层（结算盖在主界面上）。点返回可用 closeTop()。
 * 面板根节点带 data-ui，点击不会穿透成游戏操作。
 *
 * 常用：
 * ctx.ui.register(new ShopView())
 * ctx.ui.open("shop")
 * ctx.ui.open("result", { score: 12 })
 * ctx.ui.close("shop")
 * ctx.ui.closeTop()
 * ctx.ui.closeAll()
 * ctx.ui.isOpen("shop")
 */
export class UIManager {
  private ctx: GameContext | null = null;
  private readonly views = new Map<string, IView>();
  private readonly created = new Set<string>();
  private readonly stack: Layer[] = [];
  private readonly root: HTMLDivElement;

  constructor(mount: HTMLElement) {
    this.root = document.createElement("div");
    this.root.dataset.ui = "root";
    this.root.style.cssText =
      "position:absolute;inset:0;pointer-events:none;z-index:10;";
    mount.appendChild(this.root);
  }

  public bind(ctx: GameContext): void {
    this.ctx = ctx;
  }

  public register(view: IView): void {
    this.views.set(view.name, view);
  }

  public isOpen(name: string): boolean {
    return this.stack.some((layer) => layer.view.name === name);
  }

  public open(name: string, params?: unknown): void {
    const view = this.views.get(name);
    if (!view) {
      throw new Error(`界面未注册: ${name}，请先 ctx.ui.register`);
    }
    const existing = this.stack.find((layer) => layer.view.name === name);
    if (existing) {
      existing.el.style.zIndex = String(100 + this.stack.length);
      view.onOpen?.(params);
      return;
    }
    const el = document.createElement("div");
    el.dataset.ui = name;
    el.style.cssText =
      "position:absolute;inset:0;pointer-events:none;z-index:" +
      String(100 + this.stack.length);
    this.root.appendChild(el);
    if (!this.created.has(name) && this.ctx) {
      view.create(el, this.ctx);
      this.created.add(name);
    } else if (!this.created.has(name)) {
      throw new Error("UIManager 尚未 bind GameContext");
    }
    this.stack.push({ view, el });
    view.onOpen?.(params);
  }

  public close(name: string): void {
    const index = this.stack.findIndex((layer) => layer.view.name === name);
    if (index < 0) {
      return;
    }
    const [layer] = this.stack.splice(index, 1);
    if (!layer) {
      return;
    }
    layer.view.onClose?.();
    layer.el.remove();
    this.created.delete(name);
  }

  public closeTop(): void {
    const layer = this.stack[this.stack.length - 1];
    if (layer) {
      this.close(layer.view.name);
    }
  }

  public closeAll(): void {
    while (this.stack.length > 0) {
      this.closeTop();
    }
  }

  public update(dt: number): void {
    for (const layer of this.stack) {
      layer.view.update?.(dt);
    }
  }
}
