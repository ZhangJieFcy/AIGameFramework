import type { GameContext } from "../types";

/**
 * 单个界面面板
 *
 * 功能说明：
 * 开始页、暂停、结算、商店都做成一个 IView，交给 ctx.ui 开关。
 *
 * 实现步骤：
 * 1. class ShopView implements IView { readonly name = "shop" ... }
 * 2. create() 里创建 DOM，挂到 root
 * 3. ctx.ui.register(new ShopView()); ctx.ui.open("shop")
 */
export interface IView {
  readonly name: string;
  create(root: HTMLElement, ctx: GameContext): void;
  onOpen?(params?: unknown): void;
  onClose?(): void;
  update?(dt: number): void;
}
