type Handler<T> = (payload: T) => void;

/**
 * 事件总线
 *
 * 功能说明：
 * 模块之间发消息，避免互相直接调用。例如 UI 发 "game:retry"，玩法监听后重开。
 *
 * 常用：
 * const off = ctx.bus.on("game:score", (n) => { ... })
 * ctx.bus.emit("game:score", 10)
 * ctx.bus.once("assets:progress", (info) => { ... })
 * off()  取消监听
 *
 * 建议命名：ui:open / audio:mute / game:xxx
 */
export class EventBus<Events extends Record<string, unknown>> {
  private readonly handlers = new Map<keyof Events, Set<Handler<unknown>>>();

  public on<K extends keyof Events>(event: K, handler: Handler<Events[K]>): () => void {
    const list = this.handlers.get(event) ?? new Set<Handler<unknown>>();
    list.add(handler as Handler<unknown>);
    this.handlers.set(event, list);
    return () => this.off(event, handler);
  }

  public once<K extends keyof Events>(event: K, handler: Handler<Events[K]>): () => void {
    const wrap: Handler<Events[K]> = (payload) => {
      this.off(event, wrap);
      handler(payload);
    };
    return this.on(event, wrap);
  }

  public off<K extends keyof Events>(event: K, handler: Handler<Events[K]>): void {
    const list = this.handlers.get(event);
    list?.delete(handler as Handler<unknown>);
  }

  public emit<K extends keyof Events>(event: K, payload: Events[K]): void {
    const list = this.handlers.get(event);
    if (!list) {
      return;
    }
    for (const handler of list) {
      handler(payload);
    }
  }
}
