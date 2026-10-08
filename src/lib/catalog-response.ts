import { NextResponse } from 'next/server';
import { CatalogError } from '@/lib/catalog';

export async function catalogResponse(action: () => Promise<unknown>, status = 200) {
  try {
    return NextResponse.json(await action(), { status });
  } catch (error) {
    if (error instanceof CatalogError) return NextResponse.json({ error: error.message }, { status: error.status });
    if (error instanceof SyntaxError) return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    const code = (error as { code?: string })?.code;
    if (code === '23503') return NextResponse.json({ error: 'This item is used by another record and cannot be deleted. Deactivate it instead.' }, { status: 409 });
    if (code === '23505') return NextResponse.json({ error: 'An item with these unique details already exists.' }, { status: 409 });
    console.error('Catalog operation failed:', error);
    return NextResponse.json({ error: 'Unable to save or load this item. Please try again.' }, { status: 500 });
  }
}
