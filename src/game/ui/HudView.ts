import type { GameContext, IView } from "../../framework";

const panelCss =
  "position:absolute;left:12px;top:12px;padding:10px 12px;border-radius:10px;" +
  "background:rgba(0,0,0,0.55);color:#fff;font-family:Arial,sans-serif;line-height:1.6;" +
  "pointer-events:auto;max-width:260px;";

/**
 * 示例 HUD。新游戏可复制本文件改 name 和内容。
 */
export class HudView implements IView {
  public readonly name = "hud";
  public clicks = 0;
  public platform = "";
  public gameName = "";
  private text: HTMLDivElement | null = null;
  private lastHtml = "";

  public create(root: HTMLElement, ctx: GameContext): void {
    const box = document.createElement("div");
    box.style.cssText = panelCss;
    this.text = document.createElement("div");
    box.appendChild(this.text);

    const btn = document.createElement("button");
    btn.textContent = "功能说明";
    btn.style.cssText =
      "margin-top:8px;padding:6px 10px;border:0;border-radius:8px;cursor:pointer;";
    btn.onclick = () => ctx.ui.open("help");
    box.appendChild(btn);

    root.appendChild(box);
    this.refresh();
  }

  public update(): void {
    this.refresh();
  }

  private refresh(): void {
    if (!this.text) {
      return;
    }
    const html =
      `${this.gameName}<br>` +
      `平台: ${this.platform}<br>` +
      `点击次数: ${this.clicks}<br>` +
      `<span style="opacity:.8">点空白处变色；按钮看用法</span>`;
    // 内容没变就不重写 DOM，避免每帧 innerHTML 开销
    if (html === this.lastHtml) {
      return;
    }
    this.lastHtml = html;
    this.text.innerHTML = html;
  }
}
