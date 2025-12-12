import { createClient } from "@/lib/supabase/server";

export async function getUserCountryCode(): Promise<string> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return '+20'; // Default to Egypt
  }
  
  const { data: catalog } = await supabase
    .from('catalogs')
    .select('country_code')
    .eq('user_id', user.id)
    .single();
  
  return catalog?.country_code || '+20';
}
