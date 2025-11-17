'use server';

import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const catalogSchema = z.object({
  name: z.string()
    .min(3)
    .max(50)
    .regex(/^[a-z0-9-]+$/),
  logo: z.instanceof(File)
    .refine((file) => file.size > 0, "Logo is required.")
    .refine((file) => file.size <= MAX_FILE_SIZE, `Max file size is 5MB.`)
    .refine(
      (file) => ACCEPTED_IMAGE_TYPES.includes(file.type),
      ".jpg, .jpeg, .png and .webp files are accepted."
    ),
});

export async function checkCatalogName(name: string): Promise<boolean> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('catalogs')
    .select('name')
    .eq('name', name)
    .single();
  
  return !data;
}

export async function createCatalog(prevState: any, formData: FormData) {
  const supabase = createClient();
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
    return { message: 'بيانات غير صالحة.' };
  }

  const { name, logo } = validatedFields.data;

  // Re-check uniqueness on the server to be safe
  const isAvailable = await checkCatalogName(name);
  if (!isAvailable) {
    return { message: "اسم الكتالوج هذا مستخدم بالفعل." };
  }

  // Upload logo
  const supabaseService = createServiceRoleClient();
  const logoFileName = `${user.id}-${Date.now()}.${logo.name.split('.').pop()}`;
  const { data: uploadData, error: uploadError } = await supabaseService.storage
    .from('logos')
    .upload(logoFileName, logo);

  if (uploadError) {
    console.error('Storage Error:', uploadError);
    return { message: 'فشل تحميل الشعار.' };
  }
  
  const { data: { publicUrl } } = supabaseService.storage.from('logos').getPublicUrl(uploadData.path);

  // Create catalog entry
  const { error: dbError } = await supabaseService.from('catalogs').insert({
    name,
    user_id: user.id,
    logo_url: publicUrl,
  });

  if (dbError) {
    console.error('DB Error:', dbError);
    // Clean up uploaded logo if db insert fails
    await supabaseService.storage.from('logos').remove([logoFileName]);
    return { message: 'فشل إنشاء الكتالوج في قاعدة البيانات.' };
  }

  revalidatePath('/dashboard');
  redirect('/dashboard');
}


export async function updateCatalog(catalogId: number, formData: FormData) {
    // Similar logic to createCatalog, but for updating.
    // Omitted for brevity but would handle name changes and logo updates.
    // Remember to handle deleting the old logo from storage if a new one is uploaded.
    revalidatePath('/dashboard/settings');
    revalidatePath(`/c/${formData.get('name')}`);
    return { error: 'لم يتم تنفيذ وظيفة التحديث بعد' };
}
