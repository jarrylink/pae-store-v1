import { PRODUCTS } from '@/lib/data/products';
import { Product } from '@/types';
import { queryWithParams } from '@/lib/db';

export interface CatalogSearchResult {
  id: number;
  title: string;
  name?: string;
  price: number;
  category: string;
  spec?: string;
  capacity?: string;
  brand?: string;
  type: 'product' | 'service' | 'accessory';
  inStock?: boolean;
  inventory?: number;
  description?: string;
  score?: number;
}

// Built-in verified catalog of installation and maintenance services
export const DEFAULT_SERVICES: CatalogSearchResult[] = [
  {
    id: 101,
    title: 'Standard Solar Installation (Basic 1kVA - 3kVA)',
    name: 'Standard Solar Installation (Basic 1kVA - 3kVA)',
    price: 45000,
    category: 'Installation',
    type: 'service',
    spec: 'Professional mounting, DC/AC cabling, system earthing & testing',
    capacity: '1kVA - 3kVA',
    brand: 'Power Afric',
    inStock: true,
  },
  {
    id: 102,
    title: 'Premium Solar Installation (5kVA - 10kVA)',
    name: 'Premium Solar Installation (5kVA - 10kVA)',
    price: 95000,
    category: 'Installation',
    type: 'service',
    spec: 'High-capacity DC cabling, surge protection installation, inverter setup',
    capacity: '5kVA - 10kVA',
    brand: 'Power Afric',
    inStock: true,
  },
  {
    id: 103,
    title: 'Commercial Solar Installation (15kVA - 30kVA)',
    name: 'Commercial Solar Installation (15kVA - 30kVA)',
    price: 180000,
    category: 'Installation',
    type: 'service',
    spec: 'Three-phase industrial cabling, lightning protection & distribution board',
    capacity: '15kVA - 30kVA',
    brand: 'Power Afric',
    inStock: true,
  },
  {
    id: 104,
    title: 'Preventive Maintenance & Cleaning Service',
    name: 'Preventive Maintenance & Cleaning Service',
    price: 25000,
    category: 'Maintenance',
    type: 'service',
    spec: 'Panel cleaning, terminal retightening, BMS health check & load test',
    capacity: 'All Systems',
    brand: 'Power Afric',
    inStock: true,
  },
  {
    id: 105,
    title: 'Solar System Energy Audit & Load Analysis',
    name: 'Solar System Energy Audit & Load Analysis',
    price: 20000,
    category: 'Consultation',
    type: 'service',
    spec: 'On-site load assessment, appliance profiling & sizing recommendation',
    capacity: 'Consultation',
    brand: 'Power Afric',
    inStock: true,
  },
  {
    id: 106,
    title: 'Battery Rack Setup & Cell Balancing',
    name: 'Battery Rack Setup & Cell Balancing',
    price: 30000,
    category: 'Installation',
    type: 'service',
    spec: 'Heavy rack assembly, busbar connection, cell equalization & BMS sync',
    capacity: 'Lithium / Gel',
    brand: 'Power Afric',
    inStock: true,
  },
];

// Built-in verified catalog of accessories and balance-of-system components
export const DEFAULT_ACCESSORIES: CatalogSearchResult[] = [
  {
    id: 201,
    title: 'MC4 Solar Connector Set (Pair Male + Female)',
    name: 'MC4 Solar Connector Set (Pair Male + Female)',
    price: 3500,
    category: 'Connectors',
    type: 'accessory',
    spec: 'IP67 Waterproof, 1000V DC rated, 30A current capacity',
    brand: 'ConnectX',
    inStock: true,
  },
  {
    id: 202,
    title: '6mm² DC Solar PV Cable (100m Roll, Red & Black)',
    name: '6mm² DC Solar PV Cable (100m Roll, Red & Black)',
    price: 85000,
    category: 'Cables',
    type: 'accessory',
    spec: 'Tinned copper, XLPE double-insulated, UV and weather resistant',
    brand: 'KBE Solar',
    inStock: true,
  },
  {
    id: 203,
    title: '16mm² Pure Copper Battery Interlink Cable (1m Pair with Lugs)',
    name: '16mm² Pure Copper Battery Interlink Cable (1m Pair with Lugs)',
    price: 18000,
    category: 'Cables',
    type: 'accessory',
    spec: 'Heavy-duty copper lugs, heat-shrink insulated, 12V/24V/48V',
    brand: 'Power Afric',
    inStock: true,
  },
  {
    id: 204,
    title: '25mm² Pure Copper Heavy Battery Cable (1m Pair with Lugs)',
    name: '25mm² Pure Copper Heavy Battery Cable (1m Pair with Lugs)',
    price: 26000,
    category: 'Cables',
    type: 'accessory',
    spec: 'Ultra-low resistance, high flexibility, rated for 5kVA+ inverters',
    brand: 'Power Afric',
    inStock: true,
  },
  {
    id: 205,
    title: 'DC Circuit Breaker 63A 2-Pole (500V)',
    name: 'DC Circuit Breaker 63A 2-Pole (500V)',
    price: 14500,
    category: 'Protection',
    type: 'accessory',
    spec: 'DIN rail mount, quick magnetic trip for PV string & battery protection',
    brand: 'Schneider Electric',
    inStock: true,
  },
  {
    id: 206,
    title: 'DC Surge Protective Device (SPD) 600V 2P',
    name: 'DC Surge Protective Device (SPD) 600V 2P',
    price: 16000,
    category: 'Protection',
    type: 'accessory',
    spec: 'Type 2 lightning surge protection for solar PV arrays',
    brand: 'Chint',
    inStock: true,
  },
  {
    id: 207,
    title: 'Automatic Transfer Switch (ATS) 63A Dual Power',
    name: 'Automatic Transfer Switch (ATS) 63A Dual Power',
    price: 38000,
    category: 'Switchgear',
    type: 'accessory',
    spec: '230V AC seamless automatic changeover from Mains/Gen to Solar',
    brand: 'TOMZN',
    inStock: true,
  },
  {
    id: 208,
    title: 'Solar Panel Mounting Rail Kit (4.2m Rails + Mid/End Clamps)',
    name: 'Solar Panel Mounting Rail Kit (4.2m Rails + Mid/End Clamps)',
    price: 42000,
    category: 'Mounting',
    type: 'accessory',
    spec: 'Anodized aluminum alloy 6005-T5, roof mount hardware included',
    brand: 'SunMount',
    inStock: true,
  },
  {
    id: 209,
    title: '4-Tier Heavy-Duty Battery Rack',
    name: '4-Tier Heavy-Duty Battery Rack',
    price: 65000,
    category: 'Racks',
    type: 'accessory',
    spec: 'Reinforced powder-coated steel frame, holds up to 4x 200Ah batteries',
    brand: 'Power Afric',
    inStock: true,
  },
  {
    id: 210,
    title: 'Victron BMV-712 Smart Battery Monitor with Bluetooth',
    name: 'Victron BMV-712 Smart Battery Monitor with Bluetooth',
    price: 145000,
    category: 'Monitoring',
    type: 'accessory',
    spec: 'Precision voltage, current, ampere-hours, State of Charge (SoC)',
    brand: 'Victron Energy',
    inStock: true,
  },
];

/**
 * Normalizes tokens for resilient fuzzy keyword matching.
 */
function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((t) => t.length > 1);
}

/**
 * Calculates a match score between query tokens and an item's attributes.
 */
function calculateScore(
  item: { title: string; brand?: string; spec?: string; capacity?: string; category?: string },
  queryTokens: string[]
): number {
  if (queryTokens.length === 0) return 1;

  const searchableText = `${item.title} ${item.brand || ''} ${item.spec || ''} ${item.capacity || ''} ${item.category || ''}`.toLowerCase();
  let matches = 0;
  let exactBonus = 0;

  for (const token of queryTokens) {
    if (searchableText.includes(token)) {
      matches++;
      // Bonus if matched token is capacity or brand exactly
      if (item.capacity?.toLowerCase().includes(token) || item.brand?.toLowerCase().includes(token)) {
        exactBonus += 0.5;
      }
    }
  }

  if (matches === 0) return 0;
  const ratio = matches / queryTokens.length;
  return ratio + exactBonus;
}

/**
 * Filters PRODUCTS from `@/lib/data/products.ts` by title, brand, capacity, and spec.
 */
export function searchProducts(query: string): CatalogSearchResult[] {
  const tokens = tokenize(query);

  const results: CatalogSearchResult[] = PRODUCTS.map((p) => {
    const score = calculateScore(p, tokens);
    return {
      id: p.id,
      title: p.title,
      name: p.title,
      price: p.price,
      category: p.category,
      spec: p.spec,
      capacity: p.capacity,
      brand: p.brand,
      type: 'product' as const,
      inStock: p.inStock,
      inventory: p.inventory,
      score,
    };
  })
    .filter((item) => (tokens.length === 0 ? true : (item.score || 0) > 0.2))
    .sort((a, b) => (b.score || 0) - (a.score || 0));

  return results;
}

/**
 * Searches available installation and maintenance services.
 */
export function searchServices(query: string): CatalogSearchResult[] {
  const tokens = tokenize(query);

  const results: CatalogSearchResult[] = DEFAULT_SERVICES.map((s) => {
    const score = calculateScore(s, tokens);
    return {
      ...s,
      score,
    };
  })
    .filter((item) => (tokens.length === 0 ? true : (item.score || 0) > 0.2))
    .sort((a, b) => (b.score || 0) - (a.score || 0));

  return results;
}

/**
 * Searches available accessories and balance-of-system components.
 */
export function searchAccessories(query: string): CatalogSearchResult[] {
  const tokens = tokenize(query);

  const results: CatalogSearchResult[] = DEFAULT_ACCESSORIES.map((a) => {
    const score = calculateScore(a, tokens);
    return {
      ...a,
      score,
    };
  })
    .filter((item) => (tokens.length === 0 ? true : (item.score || 0) > 0.2))
    .sort((a, b) => (b.score || 0) - (a.score || 0));

  return results;
}

/**
 * Synchronous unified fuzzy catalog search covering Products, Accessories, and Services.
 * Guaranteed to return instantly without network latency.
 */
export function searchCatalog(
  query: string,
  filterType: 'all' | 'product' | 'service' | 'accessory' = 'all'
): CatalogSearchResult[] {
  let combined: CatalogSearchResult[] = [];

  if (filterType === 'all' || filterType === 'product') {
    combined = combined.concat(searchProducts(query));
  }
  if (filterType === 'all' || filterType === 'service') {
    combined = combined.concat(searchServices(query));
  }
  if (filterType === 'all' || filterType === 'accessory') {
    combined = combined.concat(searchAccessories(query));
  }

  // Deduplicate by type + id and sort by score descending
  const seen = new Set<string>();
  const unique = combined.filter((item) => {
    const key = `${item.type}-${item.id}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  return unique.sort((a, b) => (b.score || 0) - (a.score || 0));
}

/**
 * Asynchronous catalog search that attempts to query live database items
 * with a 2-second timeout, seamlessly falling back to local catalog arrays
 * upon any network error or timeout.
 */
export async function searchCatalogAsync(
  query: string,
  filterType: 'all' | 'product' | 'service' | 'accessory' = 'all'
): Promise<CatalogSearchResult[]> {
  const localResults = searchCatalog(query, filterType);

  try {
    const tokens = tokenize(query);
    const searchPattern = `%${query.trim()}%`;

    let timer: NodeJS.Timeout;
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
      clearTimeout(timer);
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
