'use server';

import { ai } from '@/ai/genkit';

export async function generateSlugFromName(storeName: string): Promise<string> {
    if (!storeName || storeName.trim().length < 2) {
        return '';
    }

    try {
        const result = await ai.generate({
            prompt: `Convert this store name to a URL-friendly slug (lowercase English letters, numbers, and hyphens only). 
      
Store name: "${storeName}"

Rules:
1. If the name is in Arabic, transliterate it to English (e.g., "الفلاح" → "alfalah", "متجر السعادة" → "saada-store")
2. If the name is already in English, just convert to lowercase and replace spaces with hyphens
3. Remove any special characters
4. Keep it short and memorable (max 20 characters)
5. Return ONLY the slug, nothing else

Examples:
- "الفلاح" → "alfalah"
- "متجر الهنا" → "alhana"
- "Fashion Store" → "fashion-store"
- "بيت الموضة" → "beit-almoda"

Slug:`,
            config: {
                maxOutputTokens: 50,
                temperature: 0.1,
            },
        });

        const slug = result.text
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9-]/g, '')
            .slice(0, 20);

        return slug || 'my-store';
    } catch (error) {
        console.error('Error generating slug:', error);
        // Fallback: generate a simple slug
        return 'store-' + Date.now().toString(36).slice(-6);
    }
}
