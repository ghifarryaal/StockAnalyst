-- ============================================
-- Stock Analysis Cache Table
-- ============================================
-- Tabel ini menyimpan hasil analisis saham untuk caching
-- TTL (Time To Live): Data dianggap expired setelah 6 jam

CREATE TABLE IF NOT EXISTS stock_analysis_cache (
  id BIGSERIAL PRIMARY KEY,
  ticker VARCHAR(10) NOT NULL,
  analysis_text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '6 hours'),
  
  -- Metadata tambahan
  data_source VARCHAR(50) DEFAULT 'n8n_webhook',
  cache_version INTEGER DEFAULT 1,
  
  -- Constraints
  CONSTRAINT ticker_uppercase CHECK (ticker = UPPER(ticker))
);

-- ============================================
-- Indexes untuk Performance
-- ============================================

-- Index utama untuk query by ticker (paling sering digunakan)
CREATE INDEX idx_ticker_expires ON stock_analysis_cache(ticker, expires_at DESC);

-- Index untuk cleanup expired data
CREATE INDEX idx_expires_at ON stock_analysis_cache(expires_at);

-- Index untuk monitoring
CREATE INDEX idx_created_at ON stock_analysis_cache(created_at DESC);

-- ============================================
-- Row Level Security (RLS)
-- ============================================

-- Enable RLS
ALTER TABLE stock_analysis_cache ENABLE ROW LEVEL SECURITY;

-- Policy: Semua orang bisa baca cache (public read)
CREATE POLICY "Public read access" 
ON stock_analysis_cache
FOR SELECT 
USING (true);

-- Policy: Semua orang bisa insert (untuk simplicity, bisa diubah nanti)
-- Alternatif: Hanya authenticated users atau service role
CREATE POLICY "Public insert access" 
ON stock_analysis_cache
FOR INSERT 
WITH CHECK (true);

-- Policy: Hanya creator yang bisa update (optional, untuk future)
CREATE POLICY "Owner update access" 
ON stock_analysis_cache
FOR UPDATE 
USING (true);

-- ============================================
-- Function untuk Auto-cleanup Expired Data
-- ============================================

CREATE OR REPLACE FUNCTION cleanup_expired_cache()
RETURNS void AS $$
BEGIN
  DELETE FROM stock_analysis_cache
  WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- Function untuk Get Latest Valid Cache
-- ============================================

CREATE OR REPLACE FUNCTION get_latest_cache(p_ticker VARCHAR)
RETURNS TABLE (
  id BIGINT,
  ticker VARCHAR,
  analysis_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.ticker,
    c.analysis_text,
    c.created_at,
    c.expires_at
  FROM stock_analysis_cache c
  WHERE c.ticker = UPPER(p_ticker)
    AND c.expires_at > NOW()
  ORDER BY c.created_at DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- Scheduled Job untuk Auto-cleanup (Optional)
-- ============================================
-- Jalankan di Supabase Dashboard > Database > Cron Jobs
-- Schedule: 0 */6 * * * (setiap 6 jam)
-- SQL: SELECT cleanup_expired_cache();

-- ============================================
-- Sample Queries untuk Testing
-- ============================================

-- Insert sample data
-- INSERT INTO stock_analysis_cache (ticker, analysis_text)
-- VALUES ('BBCA', '📊 **Analisis BBCA**...');

-- Get cache untuk ticker tertentu
-- SELECT * FROM get_latest_cache('BBCA');

-- Manual cleanup
-- SELECT cleanup_expired_cache();

-- Check semua cache yang masih valid
-- SELECT ticker, created_at, expires_at 
-- FROM stock_analysis_cache 
-- WHERE expires_at > NOW()
-- ORDER BY created_at DESC;
