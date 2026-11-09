import { NextRequest } from 'next/server';
import { streamText, tool, convertToModelMessages, isStepCount } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { z } from 'zod';
import { searchCatalog } from '@/lib/ai/catalogSearch';
import { searchCatalogAsync } from '@/lib/ai/catalogDbSearch';

// Initialize the Google Generative AI provider with environment key
const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GOOGLE_API_KEY || '',
});

export const maxDuration = 45;

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    if (!Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: 'Messages array is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Normalize messages so both legacy string content and modern parts are supported
    const normalizedMessages = messages.map((m: any) => {
      if (!m.parts && typeof m.content === 'string') {
        return {
          ...m,
          parts: [{ type: 'text', text: m.content }],
        };
      }
      return m;
    });

    const modelMessages = await convertToModelMessages(normalizedMessages);

    const result = streamText({
      model: google('gemini-3.5-flash-lite'),
      stopWhen: isStepCount(5),
      system: `You are the Power Afric Store AI Invoice Specialist & Sales Engineer.
Your objective is to help administrators and sales agents quickly construct accurate, professional Commercial Solar Invoices.

CORE ARCHITECTURAL RULES:
1. STRICT CATALOG INTEGRITY (ZERO HALLUCINATION):
   - You MUST NEVER invent, guess, or hallucinate product models, capacities, specifications, or prices.
   - You MUST ALWAYS call the 'search_catalog' tool first before recommending or adding any item.
   - Verify that the item exists in the Power Afric catalog.
   - If an item does not exist in the catalog, clearly tell the user: "Item '[item]' is not in our verified inventory", and propose the closest real alternatives from the search results.
   - NEVER call 'update_invoice_items' with fabricated products or arbitrary pricing.

2. CURRENCY & ZERO-VAT RULE:
   - All prices and monetary amounts are in Nigerian Naira (NGN / ₦).
   - In accordance with Power Afric pricing standards, commercial invoices have strictly 0% VAT (prices are VAT-inclusive). Do NOT add VAT or tax. Total is strictly: Subtotal - Discount.

3. WORKFLOW & ENFORCED AUTO-ADDING TO INVOICE CANVAS:
   - When the user asks for a kit, product, or installation service, search the catalog. Immediately following the search, you MUST invoke the 'update_invoice_items' tool in the same execution cycle to automatically place the best-matching products, accessories, and services onto the invoice canvas without waiting for further user confirmation.
   - Never just list items in text and ask "Shall I add them?". Automatically invoke 'update_invoice_items' with the resolved catalog items, correct unit prices, quantities, and types.
   - Then provide a polite, concise summary confirming the items added, quantities, unit prices in ₦, and updated total.

4. USER INTENT DETECTION:
   - If user provides customer information (name, phone, email, delivery address), include it in 'update_invoice_items'.
   - If user mentions discounts (e.g., "Give 50,000 naira discount"), include it in 'update_invoice_items'.
   - Be helpful, concise, and professional. Always refer to the document as an "Invoice" or "Commercial Invoice" (NEVER "receipt").`,
      messages: modelMessages,
      tools: {
        search_catalog: tool({
          description:
            'Search the official Power Afric catalog for products (inverters, batteries, panels, kits), balance-of-system accessories (cables, breakers, switches), and services (installation, maintenance, audit).',
          inputSchema: z.object({
            query: z.string().describe('The product, accessory, or service search keywords'),
            category: z
              .enum(['all', 'product', 'service', 'accessory'])
              .optional()
              .describe('Optional category filter'),
          }),
          execute: async ({ query, category = 'all' }: { query: string; category?: 'all' | 'product' | 'service' | 'accessory' }) => {
            const results = await searchCatalogAsync(query, category);
            return {
              query,
              category,
              matchCount: results.length,
              results: results.slice(0, 8),
            };
          },
        }),

        update_invoice_items: tool({
          description:
            'Update or append verified items to the live interactive invoice draft. Call this tool after verifying items from search_catalog.',
          inputSchema: z.object({
            action: z
              .enum(['set', 'add'])
              .default('add')
              .describe('Whether to append to the existing invoice items ("add") or replace them entirely ("set")'),
            items: z
              .array(
                z.object({
                  id: z.union([z.number(), z.string()]).describe('Verified catalog item ID'),
                  name: z.string().describe('Verified title of the item'),
                  type: z
                    .enum(['product', 'service', 'accessory'])
                    .describe('Item category type'),
                  quantity: z.number().int().positive().describe('Quantity of this item'),
                  unitPrice: z.number().nonnegative().describe('Unit price in Nigerian Naira (₦)'),
                  spec: z.string().optional().describe('Technical specification'),
                  capacity: z.string().optional().describe('Power capacity or rating'),
                })
              )
              .describe('Array of verified line items to bill'),
            customer: z
              .object({
                name: z.string().optional(),
                phone: z.string().optional(),
                email: z.string().optional(),
                address: z.string().optional(),
              })
              .optional()
              .describe('Customer contact and delivery details if supplied'),
            discount: z
              .number()
              .nonnegative()
              .optional()
              .describe('Optional invoice discount in Naira'),
            notes: z
              .string()
              .optional()
              .describe('Optional invoice notes or payment terms'),
          }),
          execute: async ({
            action,
            items,
            customer,
            discount,
            notes,
          }: {
            action: 'set' | 'add';
            items: Array<{
              id: number | string;
              name: string;
              type: 'product' | 'service' | 'accessory';
              quantity: number;
              unitPrice: number;
              spec?: string;
              capacity?: string;
            }>;
            customer?: {
              name?: string;
              phone?: string;
              email?: string;
              address?: string;
            };
            discount?: number;
            notes?: string;
          }) => {
            return {
              success: true,
              action,
              itemCount: items.length,
              items,
              customer,
              discount,
              notes,
              timestamp: new Date().toISOString(),
            };
          },
        }),
      },
    });

    return result.toUIMessageStreamResponse();
  } catch (error: any) {
    console.error('Invoice Agent API Error:', error);
    return new Response(
      JSON.stringify({
        error: error.message || 'Internal server error in AI Invoice Agent',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
