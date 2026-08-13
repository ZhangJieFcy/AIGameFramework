export class Time {
  private lastMs = performance.now();
  public deltaSeconds = 0;

  public tick(): number {
    const now = performance.now();
    this.deltaSeconds = Math.min(0.1, (now - this.lastMs) / 1000);
    this.lastMs = now;
    return this.deltaSeconds;
  }
}
