-- BioTaste Database Schema

-- Users Table
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  pin TEXT,
  points INTEGER DEFAULT 0,
  streak_days INTEGER DEFAULT 0,
  last_rating_date DATE,
  role TEXT DEFAULT 'employee',
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Products Table
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL,
  category TEXT,
  supplier TEXT,
  image_url TEXT,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Row Level Security (RLS) Policy for public read access
CREATE POLICY "Allow public read access" ON products
  FOR SELECT
  USING (true);

-- Charges Table
CREATE TABLE charges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES products(id),
  charge_code TEXT NOT NULL,
  delivery_date DATE NOT NULL,
  supplier_batch TEXT,
  qr_code TEXT UNIQUE,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ratings Table
CREATE TABLE ratings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  charge_id UUID REFERENCES charges(id),
  overall_stars INTEGER CHECK (overall_stars BETWEEN 1 AND 5),
  taste_emoji TEXT,
  optic_emoji TEXT,
  texture_emoji TEXT,
  comment TEXT CHECK (LENGTH(comment) <= 150),
  photo_url TEXT,
  points_earned INTEGER DEFAULT 15,
  -- Bias-Kontroll Metadaten (Masterplan EISERN)
  shift TEXT CHECK (shift IN ('frueh', 'spaet')), -- Schicht-Bias Kontrolle
  location TEXT, -- Standort
  batch_id TEXT, -- Chargen-ID
  rated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(), -- Exakter Zeitpunkt
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, charge_id)
);

-- Rewards Table
CREATE TABLE rewards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  points_cost INTEGER NOT NULL,
  description TEXT,
  icon TEXT,
  active BOOLEAN DEFAULT true
);

-- Product Averages View
-- ============================================
-- v_product_signal: Ampel + Konfidenz (Masterplan)
-- ============================================
-- Regeln: n<10 = insufficient, 10<=n<30 = indicative, n>=30 = robust
CREATE VIEW product_averages AS
SELECT 
  p.id as product_id,
  p.name as product_name,
  p.category,
  p.supplier,
  c.id as charge_id,
  c.charge_code,
  c.delivery_date,
  COUNT(r.id) as rating_count,
  ROUND(AVG(r.overall_stars), 1) as avg_stars,
  -- Konfidenz-Stufen per Masterplan
  CASE 
    WHEN COUNT(r.id) < 10 THEN 'insufficient'
    WHEN COUNT(r.id) < 30 THEN 'indicative'
    ELSE 'robust'
  END as confidence_level,
  -- Ampel erst ab n>=10 (Masterplan EISERN)
  CASE 
    WHEN COUNT(r.id) < 10 THEN NULL  -- Zu wenig Daten
    WHEN AVG(r.overall_stars) >= 4.0 THEN 'green'
    WHEN AVG(r.overall_stars) >= 2.5 THEN 'yellow'
    ELSE 'red'
  END as ampel_status,
  -- Ampel-Text für UI
  CASE 
    WHEN COUNT(r.id) < 10 THEN 'Zu wenig Daten'
    WHEN AVG(r.overall_stars) >= 4.0 THEN 'Empfohlen'
    WHEN AVG(r.overall_stars) >= 2.5 THEN 'Beobachten'
    ELSE 'Prüfen'
  END as ampel_text
FROM products p
JOIN charges c ON c.product_id = p.id
LEFT JOIN ratings r ON r.charge_id = c.id
WHERE p.active = true AND c.active = true
GROUP BY p.id, p.name, p.category, p.supplier, c.id, c.charge_code, c.delivery_date;

-- Insert Sample Data

-- Users
INSERT INTO users (name, pin, role) VALUES
  ('Anna', '1234', 'admin'),
  ('Ben', '2345', 'employee'),
  ('Clara', '3456', 'employee'),
  ('David', '4567', 'employee');

-- Products
INSERT INTO products (name, category, supplier) VALUES
  ('Bio-Äpfel Gala', 'Obst', 'Obsthof Müller'),
  ('Rispentomaten', 'Gemüse', 'BioGärtnerei Schmidt'),
  ('Basilikum', 'Kräuter', 'Kräuterhof Weber');

-- Rewards
INSERT INTO rewards (name, points_cost, description, icon) VALUES
  ('Bio-Kaffee', 300, 'Ein leckerer Bio-Kaffee', '☕'),
  ('Bio-Snack', 800, 'Snack deiner Wahl', '🍎'),
  ('Bio-Tasche', 1500, 'Stylische Bio-Tragetasche', '👜'),
  ('Extra-Urlaubstag', 5000, 'Ein freier Tag extra!', '🌟');
