-- Create catalogs table
CREATE TABLE public.catalogs (
    id bigint NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    name text NOT NULL,
    user_id uuid NOT NULL,
    logo_url text
);

ALTER TABLE public.catalogs OWNER TO postgres;
CREATE SEQUENCE public.catalogs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
ALTER TABLE public.catalogs_id_seq OWNER TO postgres;
ALTER SEQUENCE public.catalogs_id_seq OWNED BY public.catalogs.id;
ALTER TABLE ONLY public.catalogs ALTER COLUMN id SET DEFAULT nextval('public.catalogs_id_seq'::regclass);
ALTER TABLE ONLY public.catalogs
    ADD CONSTRAINT catalogs_name_key UNIQUE (name);
ALTER TABLE ONLY public.catalogs
    ADD CONSTRAINT catalogs_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.catalogs
    ADD CONSTRAINT catalogs_user_id_key UNIQUE (user_id);
ALTER TABLE ONLY public.catalogs
    ADD CONSTRAINT catalogs_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id);

-- Create categories table
CREATE TABLE public.categories (
    id bigint NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    name text NOT NULL,
    catalog_id bigint NOT NULL
);

ALTER TABLE public.categories OWNER TO postgres;
CREATE SEQUENCE public.categories_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
ALTER TABLE public.categories_id_seq OWNER TO postgres;
ALTER SEQUENCE public.categories_id_seq OWNED BY public.categories.id;
ALTER TABLE ONLY public.categories ALTER COLUMN id SET DEFAULT nextval('public.categories_id_seq'::regclass);
ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_catalog_id_fkey FOREIGN KEY (catalog_id) REFERENCES public.catalogs(id) ON DELETE CASCADE;

-- Create menu_items table
CREATE TABLE public.menu_items (
    id bigint NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    name text NOT NULL,
    description text,
    price real NOT NULL,
    image_url text,
    category_id bigint NOT NULL,
    catalog_id bigint NOT NULL
);

ALTER TABLE public.menu_items OWNER TO postgres;
CREATE SEQUENCE public.menu_items_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
ALTER TABLE public.menu_items_id_seq OWNER TO postgres;
ALTER SEQUENCE public.menu_items_id_seq OWNED BY public.menu_items.id;
ALTER TABLE ONLY public.menu_items ALTER COLUMN id SET DEFAULT nextval('public.menu_items_id_seq'::regclass);
ALTER TABLE ONLY public.menu_items
    ADD CONSTRAINT menu_items_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.menu_items
    ADD CONSTRAINT menu_items_catalog_id_fkey FOREIGN KEY (catalog_id) REFERENCES public.catalogs(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.menu_items
    ADD CONSTRAINT menu_items_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id) ON DELETE CASCADE;


-- Policies for catalogs
ALTER TABLE public.catalogs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for all users" ON public.catalogs FOR SELECT USING (true);
CREATE POLICY "Users can insert their own catalog" ON public.catalogs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own catalog" ON public.catalogs FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own catalog" ON public.catalogs FOR DELETE USING (auth.uid() = user_id);

-- Policies for categories
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for all users" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Users can manage categories for their own catalog" ON public.categories USING (
  (auth.uid() = ( SELECT catalogs.user_id
   FROM catalogs
  WHERE (catalogs.id = categories.catalog_id)))
);

-- Policies for menu_items
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for all users" ON public.menu_items FOR SELECT USING (true);
CREATE POLICY "Users can manage items for their own catalog" ON public.menu_items USING (
  (auth.uid() = ( SELECT catalogs.user_id
   FROM catalogs
  WHERE (catalogs.id = menu_items.catalog_id)))
);

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('logos', 'logos', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('menu_images', 'menu_images', true);

-- Policies for logos bucket
CREATE POLICY "Public read access for logos" ON storage.objects FOR SELECT TO anon USING (bucket_id = 'logos');
CREATE POLICY "Authenticated users can upload logos" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'logos');
CREATE POLICY "Owner can update their logo" ON storage.objects FOR UPDATE TO authenticated USING (auth.uid()::text = (storage.foldername(name))[1]);

-- Policies for menu_images bucket
CREATE POLICY "Public read for menu images" ON storage.objects FOR SELECT TO anon USING (bucket_id = 'menu_images');
CREATE POLICY "Authenticated can upload menu images" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'menu_images');
CREATE POLICY "Owner can update their menu images" ON storage.objects FOR UPDATE TO authenticated USING (auth.uid()::text = (storage.foldername(name))[1]);
