-- Add theme column to catalogs table
ALTER TABLE catalogs ADD COLUMN IF NOT EXISTS theme TEXT DEFAULT NULL;

-- Add comment for documentation
COMMENT ON COLUMN catalogs.theme IS 'Store theme identifier (default, gradient-1, gradient-2, gradient-3, gradient-4)';
