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
  display_name: z.string()
    .min(3, 'يجب أن يكون اسم العرض 3 أحرف على الأقل')
    .max(50, 'يجب أن يكون اسم العرض 50 حرفًا على الأكثر'),
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

  const logoFile = formData.get('logo');

  const validatedFields = catalogSchema.safeParse({
    name: formData.get('name'),
    display_name: formData.get('display_name'),
    logo: logoFile instanceof File && logoFile.size > 0 ? logoFile : undefined,
  });

  if (!validatedFields.success) {
    console.error("Validation failed:", validatedFields.error.flatten().fieldErrors);
    const firstError = Object.values(validatedFields.error.flatten().fieldErrors)[0]?.[0] || 'بيانات غير صالحة.';
    return { message: firstError };
  }

  const { name, display_name, logo } = validatedFields.data;

  // Re-check uniqueness on the server to be safe
  const isAvailable = await checkCatalogName(name);
  if (!isAvailable) {
    return { message: "اسم الكتالوج هذا مستخدم بالفعل." };
  }

  let publicUrl = '';
  let logoFileName = '';

  // Upload logo if present
  if (logo) {
    logoFileName = `${user.id}-${Date.now()}.${logo.name.split('.').pop()}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('logos')
      .upload(logoFileName, logo);

    if (uploadError) {
      console.error('Storage Error:', uploadError);
      return { message: 'فشل تحميل الشعار.' };
    }

    const { data } = supabase.storage.from('logos').getPublicUrl(uploadData.path);
    publicUrl = data.publicUrl;
  }

  // Create catalog entry
  const { error: dbError } = await supabase.from('catalogs').insert({
    name,
    display_name,
    user_id: user.id,
    logo_url: publicUrl,
  });

  if (dbError) {
    console.error('DB Error:', dbError);
    // Clean up uploaded logo if db insert fails
    if (logoFileName) {
      await supabase.storage.from('logos').remove([logoFileName]);
    }
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
    return { message: 'معرف الكتالوج مطلوب' };
  }

  // Get current catalog to preserve existing values
  const { data: currentCatalog } = await supabase
    .from('catalogs')
    .select('*')
    .eq('id', catalogId)
    .single();

  if (!currentCatalog) {
    return { message: 'الكتالوج غير موجود' };
  }

  const name = formData.get('name') as string || currentCatalog.name;
  const display_name = formData.get('display_name') as string || currentCatalog.display_name || currentCatalog.name;
  const logoFile = formData.get('logo') as File | null;
  const coverFile = formData.get('cover') as File | null;
  const enableSubcategories = formData.get('enable_subcategories') === 'on';

  const validatedFields = catalogSchema.safeParse({
    name,
    display_name,
    logo: logoFile instanceof File && logoFile.size > 0 ? logoFile : undefined,
    cover: coverFile instanceof File && coverFile.size > 0 ? coverFile : undefined,
    enable_subcategories: enableSubcategories,
  });

  if (!validatedFields.success) {
    console.error("Validation failed:", validatedFields.error.flatten().fieldErrors);
    const firstError = Object.values(validatedFields.error.flatten().fieldErrors)[0]?.[0] || 'بيانات غير صالحة.';
    return { message: firstError };
  }

  const { name: validatedName, display_name: validatedDisplayName, logo, cover, enable_subcategories } = validatedFields.data;

  let updateData: any = {
    name: validatedName,
    display_name: validatedDisplayName,
    enable_subcategories: enableSubcategories,
  };

  // Upload logo if provided
  if (logo && logo.size > 0) {
    console.log('Uploading logo:', logo.name, 'Size:', logo.size);
    const logoFileName = `${user.id}-${Date.now()}.${logo.name.split('.').pop()}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('logos')
      .upload(logoFileName, logo);

    if (uploadError) {
      console.error('Logo upload error:', uploadError);
      return { message: `فشل تحميل الشعار: ${uploadError.message}` };
    }

    const { data: { publicUrl } } = supabase.storage.from('logos').getPublicUrl(uploadData.path);
    updateData.logo_url = publicUrl;
    console.log('Logo uploaded successfully:', publicUrl);
  }

  // Upload cover if provided
  if (cover && cover.size > 0) {
    console.log('Uploading cover:', cover.name, 'Size:', cover.size);

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
      console.error('Cover upload error:', coverUploadError);
      return { message: `فشل تحميل صورة الغلاف: ${coverUploadError.message}` };
    }

    const { data: { publicUrl: coverPublicUrl } } = supabase.storage.from('covers').getPublicUrl(coverUploadData.path);
    updateData.cover_url = coverPublicUrl;
    console.log('Cover uploaded successfully:', coverPublicUrl);
  }

  console.log('Updating catalog with data:', updateData);
  const { error: dbError } = await supabase.from('catalogs').update(updateData).eq('id', catalogId);

  if (dbError) {
    console.error('Database update error:', dbError);
    return { message: `فشل تحديث الكتالوج: ${dbError.message}` };
  }

  console.log('Catalog updated successfully');
  revalidatePath('/dashboard/settings');
  revalidatePath(`/${name}`);
  return { message: 'تم تحديث الإعدادات بنجاح!' };
}
