/**
 * Professional text sanitization utility
 * Handles encoding issues gracefully without corrupting clean data
 */

/**
 * Safely sanitizes text strings with proper encoding handling
 * Uses a whitelist approach instead of blacklist
 */
export function sanitizeText(input: string | undefined | null): string {
  if (!input) return '';
  
  // Normalize Unicode characters
  let cleaned = input.normalize('NFC');
  
  // Remove control characters (except newlines and tabs)
  cleaned = cleaned.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
  
  // Remove invalid UTF-8 sequences
  try {
    // Encode and decode to filter out invalid sequences
    cleaned = decodeURIComponent(encodeURIComponent(cleaned));
  } catch {
    // If encoding fails, use a safer approach
    cleaned = cleaned.split('').filter(char => {
      try {
        encodeURIComponent(char);
        return true;
      } catch {
        return false;
      }
    }).join('');
  }
  
  return cleaned.trim();
}

/**
 * Safely cleans product data without over-processing
 */
export function cleanProductData<T extends Record<string, any>>(
  product: T,
  fields: (keyof T)[] = ['title', 'brand', 'spec', 'category', 'description']
): T {
  const cleaned = { ...product };
  
  for (const field of fields) {
    if (typeof cleaned[field] === 'string') {
      cleaned[field] = sanitizeText(cleaned[field]) as T[keyof T];
    }
  }
  
  return cleaned;
}
