type Handler<T> = (payload: T) => void;

export class EventBus<Events extends Record<string, unknown>> {
  private readonly handlers = new Map<keyof Events, Set<Handler<unknown>>>();

  public on<K extends keyof Events>(event: K, handler: Handler<Events[K]>): () => void {
    const list = this.handlers.get(event) ?? new Set<Handler<unknown>>();
    list.add(handler as Handler<unknown>);
    this.handlers.set(event, list);
    return () => this.off(event, handler);
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
