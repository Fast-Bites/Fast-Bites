/**
 * In-memory stale-while-revalidate cache for customer catalog reads.
 * Fresh within TTL → return cache only. After TTL → return cache immediately
 * and refresh in the background.
 */

const DEFAULT_TTL_MS = 5 * 60 * 1000; // 5 minutes

type CacheEntry<T> = {
  data: T;
  fetchedAt: number;
};

const store = new Map<string, CacheEntry<unknown>>();
const inflight = new Map<string, Promise<unknown>>();

export const catalogCacheKeys = {
  menuItems: (limit = 100, offset = 0) => `menu-items:${limit}:${offset}`,
  restaurants: (limit = 20, offset = 0) => `restaurants:${limit}:${offset}`,
  platformCategories: (businessType: string) =>
    `platform-categories:${businessType.trim().toLowerCase() || 'restaurant'}`,
  restaurant: (id: string) => `restaurant:${id}`,
  restaurantCatalog: (id: string) => `restaurant-catalog:${id}`,
};

export function peekCached<T>(key: string): T | null {
  const entry = store.get(key) as CacheEntry<T> | undefined;
  return entry ? entry.data : null;
}

export function isCacheFresh(key: string, ttlMs = DEFAULT_TTL_MS): boolean {
  const entry = store.get(key);
  if (!entry) return false;
  return Date.now() - entry.fetchedAt < ttlMs;
}

export function setCached<T>(key: string, data: T): void {
  store.set(key, { data, fetchedAt: Date.now() });
}

export function clearCatalogCache(prefix?: string): void {
  if (!prefix) {
    store.clear();
    inflight.clear();
    return;
  }
  for (const key of store.keys()) {
    if (key.startsWith(prefix)) store.delete(key);
  }
  for (const key of inflight.keys()) {
    if (key.startsWith(prefix)) inflight.delete(key);
  }
}

type CachedQueryResult<T> = {
  data: T;
  fromCache: boolean;
};

/**
 * Returns cached data when present. Refetches when missing or stale.
 * Dedupes concurrent requests for the same key.
 */
export async function cachedQuery<T>(
  key: string,
  fetcher: () => Promise<T>,
  options?: { ttlMs?: number; force?: boolean },
): Promise<CachedQueryResult<T>> {
  const ttlMs = options?.ttlMs ?? DEFAULT_TTL_MS;
  const force = options?.force ?? false;
  const cached = peekCached<T>(key);
  const fresh = !force && isCacheFresh(key, ttlMs);

  if (cached != null && fresh) {
    return { data: cached, fromCache: true };
  }

  let pending = inflight.get(key) as Promise<T> | undefined;
  if (!pending) {
    pending = (async () => {
      const data = await fetcher();
      setCached(key, data);
      return data;
    })().finally(() => {
      inflight.delete(key);
    });
    inflight.set(key, pending);
  }

  const data = await pending;
  return { data, fromCache: false };
}

/**
 * Stale-while-revalidate helper for React pages:
 * - If cache exists, call onData immediately (loading can stop)
 * - If missing or stale, fetch and call onData again with fresh result
 */
export async function loadWithCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  onData: (data: T, meta: { fromCache: boolean; isRefreshing: boolean }) => void,
  options?: { ttlMs?: number },
): Promise<void> {
  const ttlMs = options?.ttlMs ?? DEFAULT_TTL_MS;
  const cached = peekCached<T>(key);
  const fresh = isCacheFresh(key, ttlMs);

  if (cached != null) {
    onData(cached, { fromCache: true, isRefreshing: !fresh });
    if (fresh) return;
  }

  const { data } = await cachedQuery(key, fetcher, { ttlMs, force: cached != null });
  onData(data, { fromCache: false, isRefreshing: false });
}
