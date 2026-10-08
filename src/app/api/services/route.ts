import { listCatalog, saveCatalog, deleteCatalog } from '@/lib/catalog';
import { catalogResponse } from '@/lib/catalog-response';

export async function GET(request: Request) {
  return catalogResponse(() => listCatalog('Service', request.url));
}

export async function POST(request: Request) {
  return catalogResponse(async () => saveCatalog('Service', await request.json(), undefined, request), 201);
}

// Preserve collection endpoints used by existing clients.
export async function PATCH(request: Request) {
  return catalogResponse(async () => {
    const body = await request.json();
    return saveCatalog('Service', body, body?.id ?? null, request);
  });
}

export async function DELETE(request: Request) {
  return catalogResponse(() => deleteCatalog('Service', new URL(request.url).searchParams.get('id'), request));
}
