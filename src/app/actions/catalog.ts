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
  slogan: z.string().optional(),
  logo: z.instanceof(File).optional(),
  cover: z.instanceof(File).optional(),
  country_code: z.string().optional(),
  whatsapp_number: z.string().optional()
    .refine((val) => !val || /^\+?[0-9]{7,15}$/.test(val), 'رقم الهاتف غير صحيح'),
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

  const rawWhatsappCreate = formData.get('whatsapp_number');
  const whatsappCreateStr = typeof rawWhatsappCreate === 'string' ? rawWhatsappCreate.trim() : '';
  const whatsappCreateValidated = whatsappCreateStr ? whatsappCreateStr : undefined;

  const validatedFields = catalogSchema.safeParse({
    name: (formData.get('name') as string || ''),
    display_name: (formData.get('display_name') as string || ''),
    whatsapp_number: whatsappCreateValidated,
    slogan: (formData.get('slogan') as string || ''),
    logo: logoFile instanceof File && logoFile.size > 0 ? logoFile : undefined,
    cover: formData.get('cover') instanceof File && (formData.get('cover') as File).size > 0 ? formData.get('cover') as File : undefined,
    country_code: (formData.get('country_code') as string) || '+20',
  });

  if (!validatedFields.success) {
    console.error("Validation failed:", validatedFields.error.flatten().fieldErrors);
    const firstError = Object.values(validatedFields.error.flatten().fieldErrors)[0]?.[0] || 'بيانات غير صالحة.';
    return { message: firstError };
  }

  const { name, display_name, logo, cover, whatsapp_number, slogan, country_code } = validatedFields.data;

  // Re-check uniqueness on the server to be safe
  const isAvailable = await checkCatalogName(name);
  if (!isAvailable) {
    return { message: "اسم الكتالوج هذا مستخدم بالفعل." };
  }

  let publicUrl = '';
  let logoFileName = '';
  let coverPublicUrl = '';
  let coverFileName = '';

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

  // Upload cover if present
  if (cover) {
    coverFileName = `${user.id}-${Date.now()}-cover.${cover.name.split('.').pop()}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('covers')
      .upload(coverFileName, cover);

    if (uploadError) {
      console.error('Storage Error (Cover):', uploadError);
      // Don't fail the whole request if cover fails, just log it? Or fail? 
      // User expects it to work. Let's return error.
      // But first clean up logo if it was uploaded? 
      // For simplicity, let's fail.
      if (logoFileName) {
        await supabase.storage.from('logos').remove([logoFileName]);
      }
      return { message: 'فشل تحميل صورة الغلاف.' };
    }

    const { data } = supabase.storage.from('covers').getPublicUrl(uploadData.path);
    coverPublicUrl = data.publicUrl;
  }

  // Create catalog entry
  const { error: dbError } = await supabase.from('catalogs').insert({
    name,
    display_name,
    user_id: user.id,
    whatsapp_number: whatsapp_number || null,
    slogan: slogan || null,
    logo_url: publicUrl,
    cover_url: coverPublicUrl,
    country_code: country_code || '+20',
  });

  if (dbError) {
    console.error('DB Error:', dbError);
    // Clean up uploaded logo if db insert fails
    if (logoFileName) {
      await supabase.storage.from('logos').remove([logoFileName]);
    }
    if (coverFileName) {
      await supabase.storage.from('covers').remove([coverFileName]);
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

  const name = (formData.get('name') as string || currentCatalog.name || '').toString();
  const display_name = (formData.get('display_name') as string || currentCatalog.display_name || currentCatalog.name || '').toString();
  const slogan = (formData.get('slogan') as string || currentCatalog.slogan || '').toString();
  const logoFile = formData.get('logo') as File | null;
  const coverFile = formData.get('cover') as File | null;
  const rawWhatsappUpdate = formData.get('whatsapp_number');
  const whatsappUpdateCandidate = typeof rawWhatsappUpdate === 'string' && rawWhatsappUpdate.trim()
    ? rawWhatsappUpdate.trim()
    : (currentCatalog.whatsapp_number ?? '');
  const whatsappUpdateValidated = whatsappUpdateCandidate ? whatsappUpdateCandidate : undefined;

  const validatedFields = catalogSchema.safeParse({
    name,
    display_name,
    slogan,
    logo: logoFile instanceof File && logoFile.size > 0 ? logoFile : undefined,
    cover: coverFile instanceof File && coverFile.size > 0 ? coverFile : undefined,
    whatsapp_number: whatsappUpdateValidated,
  });

  if (!validatedFields.success) {
    console.error("Validation failed:", validatedFields.error.flatten().fieldErrors);
    const firstError = Object.values(validatedFields.error.flatten().fieldErrors)[0]?.[0] || 'بيانات غير صالحة.';
    return { message: firstError };
  }

  const { name: validatedName, display_name: validatedDisplayName, logo, cover, whatsapp_number: validatedWhatsappNumber, slogan: validatedSlogan } = validatedFields.data;

  let updateData: any = {
    name: validatedName,
    display_name: validatedDisplayName,

    whatsapp_number: validatedWhatsappNumber ?? null,
    slogan: validatedSlogan,
  };

  // Upload logo if provided
  if (logo && logo.size > 0) {
    console.log('Uploading logo:', logo.name, 'Size:', logo.size);

    if (logo.size > MAX_FILE_SIZE) {
      return { message: `الحد الأقصى لحجم الشعار 5 ميغابايت.` };
    }
    if (!ACCEPTED_IMAGE_TYPES.includes(logo.type)) {
      return { message: `.jpg, .jpeg, .png و .webp هي الملفات المقبولة للشعار.` };
    }

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

    const coverFileName = `${user.id}-${Date.now()}-cover.${cover.name.split('.').pop()}`;
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
