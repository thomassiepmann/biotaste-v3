-- ============================================
-- Supabase Schema for Products Table
-- ============================================
-- Creates the products table with fields:
--   - id (UUID): Primary key
--   - name (TEXT): Product name
--   - category (TEXT): Product category
--   - image_url (TEXT): URL to product image
--   - is_active (BOOLEAN): Whether the product is active
--   - created_at (TIMESTAMPTZ): Creation timestamp
-- ============================================

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster queries on active products
CREATE INDEX IF NOT EXISTS idx_products_is_active ON products (is_active);

-- Index for category filtering
CREATE INDEX IF NOT EXISTS idx_products_category ON products (category);

-- Comments for documentation
COMMENT ON TABLE products IS 'Product catalog for BioTaste app';
COMMENT ON COLUMN products.id IS 'Unique identifier (UUID)';
COMMENT ON COLUMN products.name IS 'Product name';
COMMENT ON COLUMN products.category IS 'Product category (e.g., Obst, Gemüse, Kräuter)';
COMMENT ON COLUMN products.image_url IS 'URL to product image';
COMMENT ON COLUMN products.is_active IS 'Whether the product is currently active/available';
COMMENT ON COLUMN products.created_at IS 'Timestamp when the product was created';

-- ============================================
-- Sample Data (matching existing dummy data)
-- ============================================
INSERT INTO products (id, name, category, image_url, is_active) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'Bio-Äpfel Gala', 'Obst', NULL, true),
  ('550e8400-e29b-41d4-a716-446655440002', 'Rispentomaten', 'Gemüse', NULL, true),
  ('550e8400-e29b-41d4-a716-446655440003', 'Basilikum', 'Kräuter', NULL, true)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- Row Level Security (RLS)
-- ============================================
-- Enable RLS for security
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read active products
CREATE POLICY "Allow public read access to active products" ON products
  FOR SELECT
  USING (is_active = true);

-- Policy: Only admins can insert/update/delete (blocked by default)
CREATE POLICY "Only admins can insert products" ON products
  FOR INSERT
  WITH CHECK (false);

CREATE POLICY "Only admins can update products" ON products
  FOR UPDATE
  USING (false);

CREATE POLICY "Only admins can delete products" ON products
  FOR DELETE
  USING (false);