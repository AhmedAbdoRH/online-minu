"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const catalogSchema = z.object({
  name: z.string()
    .min(3, 'يجب أن يكون الاسم 3 أحرف على الأقل')
    .max(50)
    .regex(/^[a-z0-9-]+$/, 'يجب أن يحتوي الاسم على أحرف إنجليزية صغيرة وأرقام وشرطات فقط'),
  logo: z.instanceof(File).optional(),
  cover: z.instanceof(File).optional(),
  enable_subcategories: z.boolean().default(false),
});

export async function checkCatalogName(name: string): Promise<boolean> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('catalogs')
    .select('name')
    .eq('name', name)
    .single();
  
  return !data;
}

export async function createCatalog(prevState: any, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { message: 'غير مصرح به' };
  }
  
  const validatedFields = catalogSchema.safeParse({
    name: formData.get('name'),
    logo: formData.get('logo'),
  });

  if (!validatedFields.success) {
    console.error("Validation failed:", validatedFields.error.flatten().fieldErrors);
    const firstError = Object.values(validatedFields.error.flatten().fieldErrors)[0]?.[0] || 'بيانات غير صالحة.';
    return { message: firstError };
  }

  const { name, logo } = validatedFields.data;

  // Re-check uniqueness on the server to be safe
  const isAvailable = await checkCatalogName(name);
  if (!isAvailable) {
    return { message: "اسم الكتالوج هذا مستخدم بالفعل." };
  }

  // Upload logo
  const logoFileName = `${user.id}-${Date.now()}.${logo.name.split('.').pop()}`;
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('logos')
    .upload(logoFileName, logo);

  if (uploadError) {
    console.error('Storage Error:', uploadError);
    return { message: 'فشل تحميل الشعار.' };
  }
  
  const { data: { publicUrl } } = supabase.storage.from('logos').getPublicUrl(uploadData.path);

  // Create catalog entry
  const { error: dbError } = await supabase.from('catalogs').insert({
    name,
    user_id: user.id,
    logo_url: publicUrl,
  });

  if (dbError) {
    console.error('DB Error:', dbError);
    // Clean up uploaded logo if db insert fails
    await supabase.storage.from('logos').remove([logoFileName]);
    return { message: 'فشل إنشاء الكتالوج في قاعدة البيانات.' };
  }

  revalidatePath('/dashboard');
  redirect('/dashboard');
}


export async function updateCatalog(prevState: any, formData: FormData) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { message: 'غير مصرح به' };
    }

    const catalogId = formData.get('catalogId');

    if (!catalogId) {
        return { message: "معرف الكتالوج مفقود." };
    }

    const validatedFields = catalogSchema.safeParse({
        name: formData.get('name'),
        logo: formData.get('logo'),
        cover: formData.get('cover'),
        enable_subcategories: formData.get('enable_subcategories') === 'on',
    });

    if (!validatedFields.success) {
        console.error("Validation failed:", validatedFields.error.flatten().fieldErrors);
        const firstError = Object.values(validatedFields.error.flatten().fieldErrors)[0]?.[0] || 'بيانات غير صالحة.';
        return { message: firstError };
    }

    const { name, logo, cover, enable_subcategories } = validatedFields.data;
    
    const updateData: { name?: string; logo_url?: string; cover_url?: string; enable_subcategories?: boolean } = {};

    if (name) {
        updateData.name = name;
    }
    if (enable_subcategories !== undefined) {
        updateData.enable_subcategories = enable_subcategories;
    }
    
    if (logo && logo.size > 0) {
        const logoFileName = `${user.id}-${Date.now()}.${logo.name.split('.').pop()}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('logos')
            .upload(logoFileName, logo);

        if (uploadError) {
            console.error('Storage Error:', uploadError);
            return { message: 'فشل تحميل الشعار.' };
        }

        const { data: { publicUrl } } = supabase.storage.from('logos').getPublicUrl(uploadData.path);
        updateData.logo_url = publicUrl;
    }

    // Handle cover upload
    if (cover && cover.size > 0) {
        // Validate cover file
        if (cover.size > MAX_FILE_SIZE) {
            return { message: `الحد الأقصى لحجم صورة الغلاف 5 ميغابايت.` };
        }
        if (!ACCEPTED_IMAGE_TYPES.includes(cover.type)) {
            return { message: `.jpg, .jpeg, .png و .webp هي الملفات المقبولة لصورة الغلاف.` };
        }

        const coverFileName = `${user.id}-${Date.now()}.${cover.name.split('.').pop()}`;
        const { data: coverUploadData, error: coverUploadError } = await supabase.storage
            .from('covers')
            .upload(coverFileName, cover);

        if (coverUploadError) {
            console.error('Storage Error (Cover):', coverUploadError);
            return { message: 'فشل تحميل صورة الغلاف.' };
        }

        const { data: { publicUrl: coverPublicUrl } } = supabase.storage.from('covers').getPublicUrl(coverUploadData.path);
        updateData.cover_url = coverPublicUrl;
    }

    const { error: dbError } = await supabase.from('catalogs').update(updateData).eq('id', catalogId);

    if (dbError) {
        console.error('DB Error:', dbError);
        return { message: 'فشل تحديث الكتالوج.' };
    }

    revalidatePath('/dashboard/settings');
    revalidatePath(`/c/${name}`);
    return { message: 'تم تحديث الإعدادات بنجاح!' };
}
