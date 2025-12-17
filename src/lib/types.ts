// Temporary Database type definition
interface Database {
  public: {
    Tables: {
      catalogs: {
        Row: {
          id: number;
          created_at: string;
          name: string;
          display_name: string | null;
          description: string | null;
          logo_url: string | null;
          cover_url: string | null;
          user_id: string;
          enable_subcategories: boolean;
          plan: string;
          whatsapp_number: string | null;
          slogan: string | null;
          country_code: string | null;
          theme: string | null;
          hide_footer: boolean | null;
        };
        Insert: {
          id?: number;
          created_at?: string;
          name: string;
          display_name?: string | null;
          description?: string | null;
          logo_url?: string | null;
          cover_url?: string | null;
          user_id?: string;
          enable_subcategories?: boolean;
          whatsapp_number?: string | null;
          slogan?: string | null;
          country_code?: string | null;
          theme?: string | null;
          hide_footer?: boolean | null;
        };
        Update: {
          id?: number;
          created_at?: string;
          name?: string;
          display_name?: string | null;
          description?: string | null;
          logo_url?: string | null;
          cover_url?: string | null;
          user_id?: string;
          enable_subcategories?: boolean;
          plan?: string;
          whatsapp_number?: string | null;
          slogan?: string | null;
          country_code?: string | null;
          theme?: string | null;
          hide_footer?: boolean | null;
        };
      };
      categories: {
        Row: {
          id: number;
          created_at: string;
          name: string;
          catalog_id: number;
          parent_category_id: number | null;
        };
        Insert: {
          id?: number;
          created_at?: string;
          name: string;
          catalog_id: number;
          parent_category_id?: number | null;
        };
        Update: {
          id?: number;
          created_at?: string;
          name?: string;
          catalog_id?: number;
          parent_category_id?: number | null;
        };
      };
      menu_items: {
        Row: {
          id: number;
          created_at: string;
          name: string;
          description: string | null;
          price: number;
          image_url: string | null;
          category_id: number;
          catalog_id: number;
        };
        Insert: {
          id?: number;
          created_at?: string;
          name: string;
          description?: string | null;
          price: number;
          image_url?: string | null;
          category_id: number;
          catalog_id: number;
        };
        Update: {
          id?: number;
          created_at?: string;
          name?: string;
          description?: string | null;
          price?: number;
          image_url?: string | null;
          category_id?: number;
          catalog_id?: number;
        };
      };
      product_images: {
        Row: {
          id: number;
          created_at: string;
          menu_item_id: number;
          image_url: string;
        };
        Insert: {
          id?: number;
          created_at?: string;
          menu_item_id: number;
          image_url: string;
        };
        Update: {
          id?: number;
          created_at?: string;
          menu_item_id?: number;
          image_url?: string;
        };
      };
      item_variants: {
        Row: {
          id: number;
          created_at: string;
          menu_item_id: number;
          name: string;
          price: number;
        };
        Insert: {
          id?: number;
          created_at?: string;
          menu_item_id: number;
          name: string;
          price: number;
        };
        Update: {
          id?: number;
          created_at?: string;
          menu_item_id?: number;
          name?: string;
          price?: number;
        };
      };
    };
  };
}

export type Catalog = Database['public']['Tables']['catalogs']['Row'];
export type NewCatalog = Database['public']['Tables']['catalogs']['Insert'];
export type UpdateCatalog = Database['public']['Tables']['catalogs']['Update'];

export type Category = Database['public']['Tables']['categories']['Row'] & { parent_category_id: number | null; };
export type NewCategory = Database['public']['Tables']['categories']['Insert'];
export type UpdateCategory = Database['public']['Tables']['categories']['Update'];

export type MenuItem = Database['public']['Tables']['menu_items']['Row'];
export type NewMenuItem = Database['public']['Tables']['menu_items']['Insert'];
export type UpdateMenuItem = Database['public']['Tables']['menu_items']['Update'];

export type ProductImage = Database['public']['Tables']['product_images']['Row'];
export type NewProductImage = Database['public']['Tables']['product_images']['Insert'];

export type ItemVariant = Database['public']['Tables']['item_variants']['Row'];
export type NewItemVariant = Database['public']['Tables']['item_variants']['Insert'];
export type UpdateItemVariant = Database['public']['Tables']['item_variants']['Update'];

export type MenuItemWithDetails = MenuItem & {
  product_images: ProductImage[];
  item_variants: ItemVariant[];
  categories: { name: string } | null;
};

export type CatalogData = Catalog & {
  categories: (Category & {
    menu_items: MenuItem[];
  })[];
};

// Hierarchical category type for storefront views
export type CategoryWithSubcategories = Category & {
  menu_items: MenuItem[];
  subcategories: CategoryWithSubcategories[];
};
