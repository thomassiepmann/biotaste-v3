-- ============================================
-- Supabase Seed File for Products
-- ============================================
-- Datum: 2026-03-08
-- Projekt: biotaste-v3
-- Feature: 10 Bio/Organic Products in German

-- ============================================
-- 10 Sample Organic/Bio Products (German)
-- ============================================
INSERT INTO products (name, description, price, category, supplier, image_url, is_available) VALUES
  ('Bio-Äpfel Gala', 'Süße, knackige Bio-Äpfel aus regionaler Erzeugung. Perfekt für den täglichen Vitamin-Bedarf.', 3.49, 'Obst', 'Obsthof Müller', 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400', true),
  ('Rispentomaten Bio', 'Saftige, sonnengereifte Bio-Tomaten am Strauch. Intensive Aromen für Salate und Gerichte.', 2.99, 'Gemüse', 'BioGärtnerei Schmidt', 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400', true),
  ('Bio-Basilikum Topf', 'Frisches, aromatisches Bio-Basilikum im Topf. Ideal für Pesto, Salate und mediterrane Küche.', 2.49, 'Kräuter', 'Kräuterhof Weber', 'https://images.unsplash.com/photo-1618375569909-3c8616cf7733?w=400', true),
  ('Bio-Karotten Bund', 'Knackige, süße Bio-Möhren mit Grün. Reich an Beta-Carotin und perfekt für Suppen und Snacks.', 1.99, 'Gemüse', 'Gemüsehof Bauer', 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=400', true),
  ('Bio-Bananen', 'Cremige, süße Bio-Bananen aus fairem Handel. Energiegeladene Früchte für zwischendurch.', 1.79, 'Obst', 'Tropenimport FairTrade', 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400', true),
  ('Bio-Petersilie glatt', 'Frische, glatte Bio-Petersilie mit intensivem Geschmack. Unverzichtbar in der deutschen Küche.', 1.29, 'Kräuter', 'Kräuterhof Weber', 'https://images.unsplash.com/photo-1623428067635-4a5a83945cec?w=400', true),
  ('Bio-Gurke', 'Erfrischende, knackige Bio-Gurke ohne Wachsschicht. Perfekt für Salate und als gesunder Snack.', 1.49, 'Gemüse', 'Gewächshaus Hoffmann', 'https://images.unsplash.com/photo-1449300079323-02e209d9d3a6?w=400', true),
  ('Bio-Orangen', 'Saftige, vitaminreiche Bio-Orangen mit süß-säuerlichem Geschmack. Ideal für frisch gepressten Saft.', 2.99, 'Obst', 'Zitrusgarten Spanien', 'https://images.unsplash.com/photo-1547514701-42782101795e?w=400', true),
  ('Bio-Schnittlauch', 'Fein-würziger Bio-Schnittlauch, geerntet am Morgen. Perfekt für Quark, Eier und Salate.', 1.19, 'Kräuter', 'Kräuterhof Weber', 'https://images.unsplash.com/photo-1623428067635-4a5a83945cec?w=400', true),
  ('Bio-Paprika rot', 'Fleischige, süße Bio-Paprika in leuchtendem Rot. Vielseitig einsetzbar für Salate und Gemüsepfannen.', 1.89, 'Gemüse', 'BioGärtnerei Schmidt', 'https://images.unsplash.com/photo-1563565375-f3fdf5d66970?w=400', true)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- Row Level Security (RLS) - Enable and Policy
-- ============================================
-- Enable RLS on products table
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Policy: Allow public read access
CREATE POLICY IF NOT EXISTS "Allow public read access" ON products
  FOR SELECT
  USING (true);

-- Policy: Only admins can modify products
CREATE POLICY IF NOT EXISTS "Only admins can insert" ON products
  FOR INSERT
  WITH CHECK (false);

CREATE POLICY IF NOT EXISTS "Only admins can update" ON products
  FOR UPDATE
  USING (false);

CREATE POLICY IF NOT EXISTS "Only admins can delete" ON products
  FOR DELETE
  USING (false);
