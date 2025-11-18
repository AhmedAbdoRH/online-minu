import type { Database } from './database.types';

export type Catalog = Database['public']['Tables']['catalogs']['Row'];
export type NewCatalog = Database['public']['Tables']['catalogs']['Insert'];
export type UpdateCatalog = Database['public']['Tables']['catalogs']['Update'];

export type Category = Database['public']['Tables']['categories']['Row'] & { parent_category_id: number | null; };
export type NewCategory = Database['public']['Tables']['categories']['Insert'];
export type UpdateCategory = Database['public']['Tables']['categories']['Update'];

export type MenuItem = Database['public']['Tables']['menu_items']['Row'];
export type NewMenuItem = Database['public']['Tables']['menu_items']['Insert'];
export type UpdateMenuItem = Database['public']['Tables']['menu_items']['Update'];

export type CatalogData = Catalog & {
  categories: (Category & {
    menu_items: MenuItem[];
  })[];
};
