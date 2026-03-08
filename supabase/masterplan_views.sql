-- ============================================
-- BIOTASTE V3 - MASTERPLAN SQL VIEWS
-- ============================================
-- Datum: 2026-03-08
-- Projekt: biotaste-v3
-- Feature: 3 kritische SQL Views per Masterplan-Spezifikation

-- ============================================
-- 1. v_product_signal - Ampel + Konfidenz
-- ============================================
-- Masterplan-Regeln:
-- - n<10: insufficient ("Zu wenig Daten")
-- - 10<=n<30: indicative
-- - n>=30: robust
-- - Ampel erst ab n>=10

CREATE OR REPLACE VIEW v_product_signal AS
SELECT 
  p.id as product_id,
  p.name as product_name,
  p.category,
  p.supplier,
  c.id as charge_id,
  c.charge_code,
  c.delivery_date,
  c.supplier_batch as batch_id,
  COUNT(r.id) as rating_count,
  ROUND(AVG(r.overall_stars), 2) as avg_stars,
  ROUND(STDDEV(r.overall_stars), 2) as stddev_stars,
  -- Konfidenz-Stufen per Masterplan
  CASE 
    WHEN COUNT(r.id) < 10 THEN 'insufficient'
    WHEN COUNT(r.id) < 30 THEN 'indicative'
    ELSE 'robust'
  END as confidence_level,
  -- Ampel nur ab n>=10 (Masterplan EISERN)
  CASE 
    WHEN COUNT(r.id) < 10 THEN NULL
    WHEN AVG(r.overall_stars) >= 4.0 THEN 'green'
    WHEN AVG(r.overall_stars) >= 2.5 THEN 'yellow'
    ELSE 'red'
  END as ampel_status,
  -- UI-Text
  CASE 
    WHEN COUNT(r.id) < 10 THEN 'Zu wenig Daten'
    WHEN AVG(r.overall_stars) >= 4.0 THEN 'Empfohlen'
    WHEN AVG(r.overall_stars) >= 2.5 THEN 'Beobachten'
    ELSE 'Prüfen'
  END as ampel_text,
  -- Priorisierungs-Score (für Home-Screen Top 5)
  -- P_score = 0.30×R_einkauf + 0.25×U_anteil + 0.20×D_lücke + 0.15×N_faktor + 0.10×L_problem
  ROUND(
    (AVG(r.overall_stars) * 0.30) + -- R_einkauf
    (COUNT(DISTINCT r.user_id)::decimal / NULLIF(COUNT(r.id), 0) * 5 * 0.25) + -- U_anteil
    (CASE WHEN COUNT(r.id) < 10 THEN 5 ELSE 0 END * 0.20) + -- D_lücke
    (CASE WHEN AVG(r.overall_stars) < 2.5 THEN 5 ELSE 0 END * 0.15) + -- N_faktor
    (COUNT(CASE WHEN r.overall_stars <= 2 THEN 1 END)::decimal / NULLIF(COUNT(r.id), 0) * 5 * 0.10) -- L_problem
  , 2) as p_score,
  -- Fokus-Flag (für Admin-Markierung)
  FALSE as is_focus_product, -- TODO: Admin-Tabelle verknüpfen
  MAX(r.rated_at) as last_rated_at
FROM products p
JOIN charges c ON c.product_id = p.id
LEFT JOIN ratings r ON r.charge_id = c.id
WHERE p.active = true AND c.active = true
GROUP BY p.id, p.name, p.category, p.supplier, c.id, c.charge_code, c.delivery_date, c.supplier_batch;

COMMENT ON VIEW v_product_signal IS 'Produkt-Ampel mit Konfidenz-Level per Masterplan (n>=10 Regel)';

-- ============================================
-- 2. v_supplier_scorecard - Lieferanten-Ranking
-- ============================================

CREATE OR REPLACE VIEW v_supplier_scorecard AS
SELECT 
  p.supplier,
  COUNT(DISTINCT p.id) as product_count,
  COUNT(r.id) as total_ratings,
  ROUND(AVG(r.overall_stars), 2) as avg_stars,
  ROUND(STDDEV(r.overall_stars), 2) as consistency_score,
  -- Qualitäts-Score (0-100)
  ROUND(
    (AVG(r.overall_stars) / 5.0 * 60) + -- Basis-Qualität (60%)
    (CASE WHEN COUNT(r.id) >= 30 THEN 20 ELSE COUNT(r.id)::decimal / 30 * 20 END) + -- Volumen (20%)
    (CASE WHEN STDDEV(r.overall_stars) < 1 THEN 20 ELSE GREATEST(0, 20 - STDDEV(r.overall_stars) * 5) END) -- Konsistenz (20%)
  , 0) as quality_score,
  -- Trend (letzte 30 Tage vs davor)
  ROUND(AVG(CASE WHEN r.rated_at >= NOW() - INTERVAL '30 days' THEN r.overall_stars END), 2) as trend_30d,
  -- Ampel auf Lieferanten-Ebene
  CASE 
    WHEN COUNT(r.id) < 30 THEN 'insufficient'
    WHEN AVG(r.overall_stars) >= 4.0 THEN 'green'
    WHEN AVG(r.overall_stars) >= 2.5 THEN 'yellow'
    ELSE 'red'
  END as supplier_ampel,
  MAX(r.rated_at) as last_delivery
FROM products p
JOIN charges c ON c.product_id = p.id
LEFT JOIN ratings r ON r.charge_id = c.id
WHERE p.active = true AND c.active = true AND p.supplier IS NOT NULL
GROUP BY p.supplier
ORDER BY quality_score DESC;

COMMENT ON VIEW v_supplier_scorecard IS 'Lieferanten-Ranking mit Qualitäts-Score und Trend';

-- ============================================
-- 3. v_weekly_action_report - ACTION_REQUIRED + PROMOTE
-- ============================================

CREATE OR REPLACE VIEW v_weekly_action_report AS
WITH product_stats AS (
  SELECT 
    p.id as product_id,
    p.name as product_name,
    p.category,
    p.supplier,
    c.charge_code,
    c.delivery_date,
    COUNT(r.id) as rating_count,
    AVG(r.overall_stars) as avg_stars,
    COUNT(CASE WHEN r.shift = 'frueh' THEN 1 END)::decimal / NULLIF(COUNT(r.id), 0) as fruehanteil,
    COUNT(CASE WHEN r.overall_stars <= 2 THEN 1 END) as problem_count,
    MAX(r.rated_at) as last_rated
  FROM products p
  JOIN charges c ON c.product_id = p.id
  LEFT JOIN ratings r ON r.charge_id = c.id
  WHERE p.active = true AND c.active = true
  GROUP BY p.id, p.name, p.category, p.supplier, c.charge_code, c.delivery_date
)
SELECT 
  product_id,
  product_name,
  category,
  supplier,
  charge_code,
  delivery_date,
  rating_count,
  ROUND(avg_stars, 2) as avg_stars,
  -- Empfehlungstyp per Masterplan
  CASE 
    -- ACTION_REQUIRED: Rot oder <10 Bewertungen mit Trend
    WHEN rating_count >= 10 AND avg_stars < 2.5 THEN 'ACTION_REQUIRED'
    WHEN rating_count >= 10 AND problem_count >= 3 THEN 'ACTION_REQUIRED'
    -- PROMOTE: Grün und robust
    WHEN rating_count >= 30 AND avg_stars >= 4.0 THEN 'PROMOTE'
    -- WATCH: Gelb oder indicative
    WHEN rating_count >= 10 AND avg_stars >= 2.5 AND avg_stars < 4.0 THEN 'WATCH'
    -- INSUFFICIENT: Zu wenig Daten
    ELSE 'INSUFFICIENT'
  END as recommendation,
  -- Priorität (1-10)
  CASE 
    WHEN rating_count >= 10 AND avg_stars < 2.0 THEN 10
    WHEN rating_count >= 10 AND avg_stars < 2.5 THEN 8
    WHEN rating_count >= 30 AND avg_stars >= 4.0 THEN 7
    WHEN rating_count >= 10 AND avg_stars < 4.0 THEN 5
    ELSE 3
  END as priority,
  -- Bias-Warnung (Frühschicht-Bias)
  CASE 
    WHEN fruehanteil > 0.8 THEN 'Schicht-Bias: 80%+ Frühschicht'
    WHEN fruehanteil < 0.2 THEN 'Schicht-Bias: 80%+ Spätschicht'
    ELSE NULL
  END as bias_warning,
  last_rated
FROM product_stats
ORDER BY priority DESC, rating_count DESC;

COMMENT ON VIEW v_weekly_action_report IS 'Wöchentliche Aktions-Empfehlungen (ACTION_REQUIRED/PROMOTE)';

-- ============================================
-- INDIZES FÜR VIEW-PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_ratings_charge_rated ON ratings(charge_id, rated_at);
CREATE INDEX IF NOT EXISTS idx_ratings_shift ON ratings(shift) WHERE shift IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_charges_product_active ON charges(product_id, active) WHERE active = true;
CREATE INDEX IF NOT EXISTS idx_products_supplier ON products(supplier) WHERE supplier IS NOT NULL;