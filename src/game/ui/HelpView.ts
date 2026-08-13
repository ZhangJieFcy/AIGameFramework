import type { GameContext, IView } from "../../framework";

/**
 * 示例说明弹窗。演示 ctx.ui.open / closeTop。
 */
export class HelpView implements IView {
  public readonly name = "help";

  public create(root: HTMLElement, ctx: GameContext): void {
    const mask = document.createElement("div");
    mask.style.cssText =
      "position:absolute;inset:0;background:rgba(0,0,0,0.45);display:flex;" +
      "align-items:center;justify-content:center;padding:20px;pointer-events:auto;";

    const card = document.createElement("div");
    card.style.cssText =
      "background:#1e2838;color:#fff;border-radius:12px;padding:16px 18px;" +
      "max-width:360px;font-family:Arial,sans-serif;line-height:1.55;font-size:14px;";
    card.innerHTML =
      `<b>开箱即用（在 MyGame 里写）</b><br/>` +
      `ctx.ui 界面　　ctx.audio 音乐音效<br/>` +
      `ctx.assets 资源　ctx.pool 对象池<br/>` +
      `ctx.bus 事件　　ctx.scheduler 定时器<br/>` +
      `ctx.tween 缓动　ctx.input 点击<br/>` +
      `ctx.save 存档　　ctx.config 配置<br/>` +
      `ctx.rng 随机　　ctx.log 日志<br/>` +
      `详细说明见 README 和各管理器文件顶部注释。`;

    const close = document.createElement("button");
    close.textContent = "关闭";
    close.style.cssText =
      "margin-top:12px;padding:6px 12px;border:0;border-radius:8px;cursor:pointer;";
    close.onclick = () => ctx.ui.closeTop();
    card.appendChild(document.createElement("br"));
    card.appendChild(close);

    mask.appendChild(card);
    root.appendChild(mask);
  }
}
