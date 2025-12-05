-- =====================================================
-- إصلاح سياسات RLS - نسخة محدثة
-- شغّل هذه الأوامر واحدة تلو الأخرى في Supabase SQL Editor
-- =====================================================

-- الخطوة 1: حذف جميع السياسات القديمة
DROP POLICY IF EXISTS "Allow public read access on catalogs" ON catalogs;
DROP POLICY IF EXISTS "Allow public read access on categories" ON categories;
DROP POLICY IF EXISTS "Allow public read access on menu_items" ON menu_items;
DROP POLICY IF EXISTS "Users can insert their own catalogs" ON catalogs;
DROP POLICY IF EXISTS "Users can update their own catalogs" ON catalogs;
DROP POLICY IF EXISTS "Users can delete their own catalogs" ON catalogs;
DROP POLICY IF EXISTS "Users can manage their catalog categories" ON categories;
DROP POLICY IF EXISTS "Users can manage their catalog items" ON menu_items;
DROP POLICY IF EXISTS "Public can read catalogs" ON catalogs;
DROP POLICY IF EXISTS "Public can read categories" ON categories;
DROP POLICY IF EXISTS "Public can read menu_items" ON menu_items;

-- الخطوة 2: تفعيل RLS
ALTER TABLE catalogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;

-- الخطوة 3: سياسات القراءة للجميع (anon + authenticated)
-- هذه هي السياسات الأهم لفتح صفحات الكتالوج

CREATE POLICY "Public can read catalogs"
ON catalogs FOR SELECT
USING (true);

CREATE POLICY "Public can read categories"
ON categories FOR SELECT
USING (true);

CREATE POLICY "Public can read menu_items"
ON menu_items FOR SELECT
USING (true);

-- الخطوة 4: سياسات الكتابة للمستخدمين المسجلين

CREATE POLICY "Users can insert their own catalogs"
ON catalogs FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own catalogs"
ON catalogs FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own catalogs"
ON catalogs FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- الخطوة 5: سياسات الفئات للمستخدمين

CREATE POLICY "Users can insert categories"
ON categories FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM catalogs
    WHERE catalogs.id = catalog_id
    AND catalogs.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update categories"
ON categories FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM catalogs
    WHERE catalogs.id = catalog_id
    AND catalogs.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete categories"
ON categories FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM catalogs
    WHERE catalogs.id = catalog_id
    AND catalogs.user_id = auth.uid()
  )
);

-- الخطوة 6: سياسات المنتجات للمستخدمين

CREATE POLICY "Users can insert menu_items"
ON menu_items FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM catalogs
    WHERE catalogs.id = catalog_id
    AND catalogs.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update menu_items"
ON menu_items FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM catalogs
    WHERE catalogs.id = catalog_id
    AND catalogs.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete menu_items"
ON menu_items FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM catalogs
    WHERE catalogs.id = catalog_id
    AND catalogs.user_id = auth.uid()
  )
);

-- =====================================================
-- للتحقق من السياسات، شغّل هذا الأمر:
-- SELECT * FROM pg_policies WHERE tablename IN ('catalogs', 'categories', 'menu_items');
-- =====================================================
