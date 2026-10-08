import { listCatalog, saveCatalog } from '@/lib/catalog';
import { catalogResponse } from '@/lib/catalog-response';

export async function GET(request: Request) {
  return catalogResponse(() => listCatalog('Product', request.url));
}

export async function POST(request: Request) {
  return catalogResponse(async () => saveCatalog('Product', await request.json(), undefined, request), 201);
}
