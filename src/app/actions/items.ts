'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import type { NewMenuItem, UpdateMenuItem } from '@/lib/types';

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

const itemSchema = z.object({
  catalogId: z.coerce.number(),
  name: z.string().min(2).max(100),
  description: z.string().max(255).optional(),
  price: z.coerce.number().min(0),
  category_id: z.coerce.number(),
  image: z
    .instanceof(File)
    .refine((file) => file.size <= MAX_FILE_SIZE, 'Max file size is 5MB.')
    .refine(
      (file) => ACCEPTED_IMAGE_TYPES.includes(file.type),
      '.jpg, .jpeg, .png and .webp files are accepted.'
    )
    .optional(),
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
    const ext = image instanceof File ? image.name.split('.').pop() || 'jpg' : 'jpg';
    const safeFileName = `${timestamp}-${randomSuffix}.${ext}`;
    const uploadPath = `${userId}/${safeFileName}`;

    let contentType = 'image/jpeg';
    if (image instanceof File) {
      contentType = image.type === 'image/jpg' ? 'image/jpeg' : image.type;
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

    const validatedFields = itemSchema.safeParse({
      catalogId: formData.get('catalogId'),
      name: formData.get('name'),
      description: formData.get('description'),
      price: formData.get('price'),
      category_id: formData.get('category_id'),
      image: formData.get('image'),
    });

    if (!validatedFields.success) {
      console.error('Validation errors:', validatedFields.error);
      return { error: 'بيانات غير صالحة.' };
    }

    const { catalogId, name, description, price, category_id, image } =
      validatedFields.data;

    // Check for plan limits
    const { data: catalog } = await supabase
      .from('catalogs')
      .select('id, plan')
      .eq('id', catalogId)
      .single();

    if (!catalog) {
      return { error: 'الكتالوج غير موجود.' };
    }

    if ((!catalog.plan || catalog.plan === 'basic')) {
      const { count } = await supabase
        .from('menu_items')
        .select('*', { count: 'exact', head: true })
        .eq('catalog_id', catalogId);

      if (count !== null && count >= 50) {
        return { error: 'LIMIT_REACHED' };
      }
    }

    let imageUrl: string | null = null;
    if (image) {
      imageUrl = await uploadImage(image, user.id);
    }

    const newItem: NewMenuItem = {
      catalog_id: catalogId,
      name,
      description,
      price,
      category_id,
      image_url: imageUrl || null,
    };

    const { error: dbError } = await supabase.from('menu_items').insert(newItem);

    if (dbError) throw dbError;

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

    const imageFile = formData.get('image') as File | null;

    const updatePayload: UpdateMenuItem = {
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      price: parseFloat(formData.get('price') as string),
      category_id: parseInt(formData.get('category_id') as string),
    };

    if (imageFile && imageFile.size > 0) {
      updatePayload.image_url = await uploadImage(imageFile, user.id);
    }

    const { error: dbError } = await supabase
      .from('menu_items')
      .update(updatePayload)
      .eq('id', itemId);

    if (dbError) throw dbError;

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
