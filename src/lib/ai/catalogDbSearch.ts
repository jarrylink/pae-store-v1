import { queryWithParams } from '@/lib/db';
import {
  searchCatalog,
  tokenize,
  calculateScore,
  CatalogSearchResult,
} from '@/lib/ai/catalogSearch';

/**
 * Server-only asynchronous catalog search that queries live Neon database items
 * with a 2-second timeout, seamlessly falling back to local catalog data arrays
 * upon any network error or timeout.
 *
 * NOTE: This file imports `@/lib/db` and must only be imported in Next.js Server
 * routes (e.g. `/api/ai/invoice-agent/route.ts`), NEVER in client components.
 */
export async function searchCatalogAsync(
  query: string,
  filterType: 'all' | 'product' | 'service' | 'accessory' = 'all'
): Promise<CatalogSearchResult[]> {
  const localResults = searchCatalog(query, filterType);

  try {
    const tokens = tokenize(query);
    const searchPattern = `%${query.trim()}%`;

    let timer: NodeJS.Timeout | undefined;
    const timeoutPromise = new Promise<never>((_, reject) => {
      timer = setTimeout(() => reject(new Error('Catalog DB search timeout')), 2000);
    });

    const dbSearchPromise = (async () => {
      const dbItems: CatalogSearchResult[] = [];

      if (filterType === 'all' || filterType === 'product') {
        const rows = await queryWithParams(
          `SELECT id, title, price, category, spec, capacity, brand, "inStock", inventory FROM "Product" WHERE "isActive" = true AND (title ILIKE $1 OR spec ILIKE $1 OR brand ILIKE $1) LIMIT 10`,
          [searchPattern]
        );
        for (const r of rows) {
          dbItems.push({
            id: Number(r.id),
            title: r.title,
            name: r.title,
            price: Number(r.price),
            category: r.category,
            spec: r.spec,
            capacity: r.capacity,
            brand: r.brand,
            type: 'product',
            inStock: r.inStock,
            inventory: r.inventory,
            score: calculateScore(r, tokens),
          });
        }
      }

      if (filterType === 'all' || filterType === 'service') {
        const rows = await queryWithParams(
          `SELECT id, name, price, category, description FROM "Service" WHERE "isActive" = true AND (name ILIKE $1 OR description ILIKE $1) LIMIT 10`,
          [searchPattern]
        );
        for (const r of rows) {
          dbItems.push({
            id: Number(r.id),
            title: r.name,
            name: r.name,
            price: Number(r.price),
            category: r.category,
            spec: r.description,
            type: 'service',
            inStock: true,
            score: calculateScore({ title: r.name, spec: r.description }, tokens),
          });
        }
      }

      if (filterType === 'all' || filterType === 'accessory') {
        const rows = await queryWithParams(
          `SELECT id, name, price, category, description, stock FROM "Accessory" WHERE "isActive" = true AND (name ILIKE $1 OR description ILIKE $1) LIMIT 10`,
          [searchPattern]
        );
        for (const r of rows) {
          dbItems.push({
            id: Number(r.id),
            title: r.name,
            name: r.name,
            price: Number(r.price),
            category: r.category,
            spec: r.description,
            type: 'accessory',
            inStock: Number(r.stock) > 0,
            score: calculateScore({ title: r.name, spec: r.description }, tokens),
          });
        }
      }

      return dbItems;
    })();

    const dbResults = await Promise.race([dbSearchPromise, timeoutPromise]).finally(() => {
      if (timer) clearTimeout(timer);
    });

    if (Array.isArray(dbResults) && dbResults.length > 0) {
      // Merge DB results with local results, prioritizing DB by key
      const merged = new Map<string, CatalogSearchResult>();
      for (const item of localResults) {
        merged.set(`${item.type}-${item.id}`, item);
      }
      for (const item of dbResults) {
        merged.set(`${item.type}-${item.id}`, item);
      }
      return Array.from(merged.values()).sort((a, b) => (b.score || 0) - (a.score || 0));
    }
  } catch (err) {
    // Graceful fallback to local results on any network or timeout error
    console.warn('[searchCatalogAsync] Live DB search skipped or timed out, returning local catalog:', (err as any)?.message || err);
  }

  return localResults;
}
