'use server';

import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from 'zod';
import type { NewMenuItem, UpdateMenuItem } from "@/lib/types";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const itemSchema = z.object({
    catalogId: z.coerce.number(),
    name: z.string().min(2).max(100),
    description: z.string().max(255).optional(),
    price: z.coerce.number().min(0),
    category_id: z.coerce.number(),
    image: z.instanceof(File)
      .refine((file) => file.size <= MAX_FILE_SIZE, `Max file size is 5MB.`)
      .refine(
        (file) => ACCEPTED_IMAGE_TYPES.includes(file.type),
        ".jpg, .jpeg, .png and .webp files are accepted."
      ),
});

async function uploadImage(image: File, userId: string): Promise<string> {
    const supabaseService = createServiceRoleClient();
    const fileName = `${userId}/${Date.now()}-${image.name}`;
    const normalizedType = image.type === 'image/jpg' ? 'image/jpeg' : image.type;
    const { data, error } = await supabaseService.storage
        .from('menu_images')
        .upload(fileName, image, { contentType: normalizedType });

    if (error) {
        throw new Error('فشل تحميل الصورة.');
    }

    const { data: { publicUrl } } = supabaseService.storage.from('menu_images').getPublicUrl(data.path);
    return publicUrl;
}

export async function createItem(formData: FormData) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: "غير مصرح به" };

    const validatedFields = itemSchema.safeParse({
        catalogId: formData.get('catalogId'),
        name: formData.get('name'),
        description: formData.get('description'),
        price: formData.get('price'),
        category_id: formData.get('category_id'),
        image: formData.get('image'),
    });

    if (!validatedFields.success) {
        return { error: "بيانات غير صالحة." };
    }
    
    const { catalogId, name, description, price, category_id, image } = validatedFields.data;

    try {
        const imageUrl = await uploadImage(image, user.id);

        const newItem: NewMenuItem = {
            catalog_id: catalogId,
            name,
            description,
            price,
            category_id,
            image_url: imageUrl,
        };

        const { error: dbError } = await supabase.from('menu_items').insert(newItem);

        if (dbError) throw dbError;

        revalidatePath('/dashboard/items');
        return { error: null };
    } catch (error: any) {
        console.error("Create item error:", error);
        return { error: error.message || 'فشل إنشاء المنتج.' };
    }
}

export async function updateItem(itemId: number, formData: FormData) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: "غير مصرح به" };

    const imageFile = formData.get('image') as File | null;
    
    const updatePayload: UpdateMenuItem = {
        name: formData.get('name') as string,
        description: formData.get('description') as string,
        price: parseFloat(formData.get('price') as string),
        category_id: parseInt(formData.get('category_id') as string),
    };

    try {
        if (imageFile && imageFile.size > 0) {
            // TODO: Delete old image from storage
            updatePayload.image_url = await uploadImage(imageFile, user.id);
        }

        const { error: dbError } = await supabase.from('menu_items').update(updatePayload).eq('id', itemId);

        if (dbError) throw dbError;

        revalidatePath('/dashboard/items');
        return { error: null };

    } catch (error: any) {
        console.error("Update item error:", error);
        return { error: error.message || 'فشل تحديث المنتج.' };
    }
}

export async function deleteItem(itemId: number) {
    const supabase = createClient();
    // TODO: Verify ownership & delete image from storage
    const { error } = await supabase.from('menu_items').delete().eq('id', itemId);

    if (error) {
        return { error: 'فشل حذف المنتج.' };
    }

    revalidatePath('/dashboard/items');
    return { error: null };
}
