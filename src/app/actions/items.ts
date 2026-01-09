'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import type { NewMenuItem, UpdateMenuItem, NewProductImage } from '@/lib/types';

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

const itemSchema = z.object({
  catalogId: z.coerce.number(),
  name: z.string().min(2).max(100),
  description: z.string().max(255).optional(),
  price: z.coerce.number().min(0).optional().or(z.literal(null)),
  category_id: z.coerce.number(),
  images: z.array(z.instanceof(File))
    .refine((files) => files.every(f => f.size <= MAX_FILE_SIZE), 'Max file size is 5MB.')
    .refine(
      (files) => files.every(f => ACCEPTED_IMAGE_TYPES.includes(f.type)),
      '.jpg, .jpeg, .png and .webp files are accepted.'
    )
    .optional(),
  variants: z.string().optional().transform((str) => {
    if (!str) return [];
    try {
      const parsed = JSON.parse(str);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }),
});

async function uploadImage(
  image: File | Blob,
  userId: string,
  fileName?: string
): Promise<string | null> {
  try {
    const supabase = await createClient();
    if (!supabase) {
      console.error('Supabase client is not available');
      return null;
    }

    // Create a safe filename (encode Arabic and special characters)
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    
    // تحسين استخراج الامتداد للتعامل مع الحالات التي يكون فيها الاسم مفقوداً أو غير صالح
    let ext = 'jpg';
    if (image instanceof File && image.name) {
      const parts = image.name.split('.');
      if (parts.length > 1) ext = parts.pop() || 'jpg';
    } else if (image.type) {
      ext = image.type.split('/').pop() || 'jpg';
    }
    
    // التأكد من أن الامتداد لا يحتوي على رموز غريبة
    ext = ext.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (ext === 'jpeg') ext = 'jpg';

    const safeFileName = `${timestamp}-${randomSuffix}.${ext}`;
    const uploadPath = `${userId}/${safeFileName}`;

    let contentType = 'image/jpeg';
    if (image.type) {
      contentType = image.type;
    } else if (ext === 'webp') {
      contentType = 'image/webp';
    } else if (ext === 'png') {
      contentType = 'image/png';
    }

    console.log('Uploading image:', { uploadPath, contentType, size: image.size });

    const { data, error } = await supabase.storage
      .from('menu_images')
      .upload(uploadPath, image, {
        contentType,
        upsert: false
      });

    if (error) {
      console.error('Storage error:', error);
      return null;
    }

    console.log('Image uploaded successfully:', data);

    const { data: urlData } = supabase.storage
      .from('menu_images')
      .getPublicUrl(data.path);

    console.log('Public URL:', urlData?.publicUrl);
    return urlData?.publicUrl || null;
  } catch (err) {
    console.error('Image upload error:', err);
    return null;
  }
}

export async function createItem(formData: FormData) {
  try {
    const supabase = await createClient();
    if (!supabase) {
      return { error: 'فشل الاتصال بقاعدة البيانات' };
    }

    const { data, error: authError } = await supabase.auth.getUser();
    const user = data?.user;

    if (authError || !user) {
      return { error: 'غير مصرح به' };
    }

    const rawImages = formData.getAll('images');
    // Filter out empty files if any
    const images = rawImages.filter((f): f is File => f instanceof File && f.size > 0);

    const validatedFields = itemSchema.safeParse({
      catalogId: formData.get('catalogId'),
      name: formData.get('name'),
      description: formData.get('description'),
      price: formData.get('price'),
      category_id: formData.get('category_id'),
      images: images,
      variants: formData.get('variants'),
    });

    if (!validatedFields.success) {
      console.error('Validation errors:', validatedFields.error);
      return { error: 'بيانات غير صالحة.' };
    }

    const { catalogId, name, description, category_id, variants } = validatedFields.data;
    let price = validatedFields.data.price || 0;

    // Determine price from variants if valid
    if (variants && variants.length > 0) {
      // Find min price
      const minPrice = Math.min(...variants.map((v: any) => parseFloat(v.price) || 0));
      if (!isNaN(minPrice)) {
        price = minPrice;
      }
    }

    // Check for plan limits
    const { data: catalog } = await supabase
      .from('catalogs')
      .select('id, plan')
      .eq('id', catalogId)
      .single();

    if (!catalog) {
      return { error: 'الكتالوج غير موجود.' };
    }

    const isPro = catalog.plan === 'pro';

    // Limit check for basic plan
    if (!isPro) {
      const { count } = await supabase
        .from('menu_items')
        .select('*', { count: 'exact', head: true })
        .eq('catalog_id', catalogId);

      if (count !== null && count >= 50) {
        return { error: 'LIMIT_REACHED' };
      }

      // Prevent multiple images for non-pro
      if (images.length > 1) {
        return { error: 'LIMIT_REACHED' }; // Reuse same error for UI trigger or use specific message
      }
    }

    // Upload images
    const uploadedUrls: string[] = [];
    for (const img of images) {
      const url = await uploadImage(img, user.id);
      if (url) uploadedUrls.push(url);
    }

    // First image acts as main image
    const mainImageUrl = uploadedUrls.length > 0 ? uploadedUrls[0] : null;

    const newItem: NewMenuItem = {
      catalog_id: catalogId,
      name,
      description,
      price, // Uses min price if variants exist
      category_id,
      image_url: mainImageUrl, // Backward compatibility
    };

    const { data: insertedItem, error: dbError } = await supabase
      .from('menu_items')
      .insert(newItem)
      .select()
      .single();

    if (dbError) throw dbError;

    // Insert variants
    if (insertedItem && variants && variants.length > 0) {
      const variantsToInsert = variants.map((v: any) => ({
        menu_item_id: insertedItem.id,
        name: v.name,
        price: parseFloat(v.price),
      }));

      const { error: variantError } = await supabase
        .from('item_variants')
        .insert(variantsToInsert);

      if (variantError) console.error('Error inserting variants:', variantError);
    }

    // Insert all images into product_images table if we have inserted key
    if (insertedItem && uploadedUrls.length > 0) {
      const productImages: NewProductImage[] = uploadedUrls.map(url => ({
        menu_item_id: insertedItem.id,
        image_url: url
      }));

      const { error: imagesError } = await supabase
        .from('product_images')
        .insert(productImages);

      if (imagesError) console.error('Error inserting product images:', imagesError);
    }

    revalidatePath('/dashboard/items');
    return { error: null };
  } catch (error: any) {
    console.error('Create item error:', error);
    return { error: error.message || 'فشل إنشاء المنتج.' };
  }
}

export async function updateItem(itemId: number, formData: FormData) {
  try {
    const supabase = await createClient();
    if (!supabase) {
      return { error: 'فشل الاتصال بقاعدة البيانات' };
    }

    const { data, error: authError } = await supabase.auth.getUser();
    const user = data?.user;

    if (authError || !user) {
      return { error: 'غير مصرح به' };
    }

    // We need catalog info to check plan
    // Get item first to get catalog_id
    const { data: existingItem } = await supabase
      .from('menu_items')
      .select('catalog_id')
      .eq('id', itemId)
      .single();

    if (!existingItem) return { error: 'المنتج غير موجود' };

    const { data: catalog } = await supabase
      .from('catalogs')
      .select('plan')
      .eq('id', existingItem.catalog_id)
      .single();

    const isPro = catalog?.plan === 'pro';

    const rawImages = formData.getAll('images');
    const images = rawImages.filter((f): f is File => f instanceof File && f.size > 0);

    // Also get variants from form data manually since we are not using the schema for full validation in update yet
    // Or we should better parse it.
    const variantsStr = formData.get('variants') as string;
    let variants: any[] = [];
    try {
      if (variantsStr) {
        variants = JSON.parse(variantsStr);
      }
    } catch (e) { console.error("Error parsing variants", e); }


    if (!isPro && images.length > 1) {
      return { error: 'LIMIT_REACHED' };
    }

    let price = parseFloat(formData.get('price') as string);
    // Determine price from variants if valid
    if (variants && variants.length > 0) {
      // Find min price
      const minPrice = Math.min(...variants.map((v: any) => parseFloat(v.price) || 0));
      if (!isNaN(minPrice)) {
        price = minPrice;
      }
    }

    const updatePayload: UpdateMenuItem = {
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      price: price, // Uses min price if variants exist
      category_id: parseInt(formData.get('category_id') as string),
    };

    const uploadedUrls: string[] = [];
    if (images.length > 0) {
      for (const img of images) {
        const url = await uploadImage(img, user.id);
        if (url) uploadedUrls.push(url);
      }
    }

    if (uploadedUrls.length > 0) {
      // We can get current item image_url to check
      const { data: currentItem } = await supabase.from('menu_items').select('image_url').eq('id', itemId).single();
      if (!currentItem?.image_url) {
        updatePayload.image_url = uploadedUrls[0];
      } else {
        // If plan is NOT PRO, and they upload 1 image, maybe they want to REPLACE the main image?
        // Since non-pro has only 1 image.
        if (!isPro) {
          updatePayload.image_url = uploadedUrls[0];
          // Should delete old one? Ideally yes but let's skip for safety.
        }
      }

      // Add all to product_images
      const productImages: NewProductImage[] = uploadedUrls.map(url => ({
        menu_item_id: itemId,
        image_url: url
      }));

      const { error: imagesError } = await supabase
        .from('product_images')
        .insert(productImages);

      if (imagesError) console.error('Error inserting product images:', imagesError);
    }

    const { error: dbError } = await supabase
      .from('menu_items')
      .update(updatePayload)
      .eq('id', itemId);

    if (dbError) throw dbError;

    // Handle variants update: Delete all existing and re-insert
    if (variants) { // Only if variants field is present (even if empty array to clear)
      // But wait, if we switch to Unified, variants should be cleared.
      // The form should send empty array if switched to unified.

      // First delete existing
      await supabase.from('item_variants').delete().eq('menu_item_id', itemId);

      if (variants.length > 0) {
        const variantsToInsert = variants.map((v: any) => ({
          menu_item_id: itemId,
          name: v.name,
          price: parseFloat(v.price),
        }));

        const { error: variantError } = await supabase
          .from('item_variants')
          .insert(variantsToInsert);

        if (variantError) console.error('Error updating variants:', variantError);
      }
    }

    revalidatePath('/dashboard/items');
    return { error: null };
  } catch (error: any) {
    console.error('Update item error:', error);
    return { error: error.message || 'فشل تحديث المنتج.' };
  }
}

export async function deleteItem(itemId: number) {
  try {
    const supabase = await createClient();
    if (!supabase) {
      return { error: 'فشل الاتصال بقاعدة البيانات' };
    }

    const { error } = await supabase
      .from('menu_items')
      .delete()
      .eq('id', itemId);

    if (error) {
      return { error: 'فشل حذف المنتج.' };
    }

    revalidatePath('/dashboard/items');
    return { error: null };
  } catch (error: any) {
    console.error('Delete item error:', error);
    return { error: error.message || 'فشل حذف المنتج.' };
  }
}
