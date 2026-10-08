import { getCatalog, saveCatalog, deleteCatalog } from '@/lib/catalog';
import { catalogResponse } from '@/lib/catalog-response';

type Context = { params: Promise<{ id: string }> };

export async function GET(request: Request, { params }: Context) {
  return catalogResponse(async () => getCatalog('Product', (await params).id, request));
}

export async function PUT(request: Request, { params }: Context) {
  return catalogResponse(async () => saveCatalog('Product', await request.json(), (await params).id, request));
}

export async function PATCH(request: Request, context: Context) {
  return PUT(request, context);
}

export async function DELETE(request: Request, { params }: Context) {
  return catalogResponse(async () => deleteCatalog('Product', (await params).id, request));
}
