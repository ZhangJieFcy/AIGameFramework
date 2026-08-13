export type StorageLike = {
  setItem: (key: string, value: string) => void;
  getItem: (key: string) => string | null;
};

export function resolveStorage(): StorageLike | null {
  const g = globalThis as { localStorage?: StorageLike; __AIGAME_STORAGE__?: StorageLike };
  if (g.localStorage) {
    return g.localStorage;
  }
  return g.__AIGAME_STORAGE__ ?? null;
}
