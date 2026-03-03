-- Crear tabla party_configuration
CREATE TABLE IF NOT EXISTS party_configuration (
  id BIGSERIAL PRIMARY KEY,
  party_key VARCHAR(255) NOT NULL UNIQUE,
  display_name VARCHAR(255) NOT NULL,
  color VARCHAR(7) NOT NULL,
  logo_url TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  party_type VARCHAR(50) DEFAULT 'general',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by BIGINT,
  updated_by BIGINT
);

-- Crear tabla party_statistics
CREATE TABLE IF NOT EXISTS party_statistics (
  id BIGSERIAL PRIMARY KEY,
  party_key VARCHAR(255) NOT NULL UNIQUE REFERENCES party_configuration(party_key) ON DELETE CASCADE,
  total_votes BIGINT DEFAULT 0,
  total_mentions BIGINT DEFAULT 0,
  general_elections_votes BIGINT DEFAULT 0,
  autonomous_elections_votes BIGINT DEFAULT 0,
  municipal_elections_votes BIGINT DEFAULT 0,
  european_elections_votes BIGINT DEFAULT 0,
  youth_association_votes BIGINT DEFAULT 0,
  average_rating DECIMAL(3,2) DEFAULT 0,
  total_ratings BIGINT DEFAULT 0,
  last_updated TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Crear tabla party_logo_history_v2
CREATE TABLE IF NOT EXISTS party_logo_history_v2 (
  id BIGSERIAL PRIMARY KEY,
  party_key VARCHAR(255) NOT NULL REFERENCES party_configuration(party_key) ON DELETE CASCADE,
  change_type VARCHAR(50) NOT NULL,
  old_display_name VARCHAR(255),
  new_display_name VARCHAR(255),
  old_color VARCHAR(7),
  new_color VARCHAR(7),
  old_logo_url TEXT,
  new_logo_url TEXT,
  changed_by BIGINT,
  changed_by_name VARCHAR(255),
  change_reason TEXT,
  timestamp TIMESTAMP DEFAULT NOW(),
  is_reverted BOOLEAN DEFAULT false,
  reverted_by BIGINT,
  reverted_at TIMESTAMP
);

-- Crear tabla party_changes_log
CREATE TABLE IF NOT EXISTS party_changes_log (
  id BIGSERIAL PRIMARY KEY,
  party_key VARCHAR(255) NOT NULL REFERENCES party_configuration(party_key) ON DELETE CASCADE,
  change_type VARCHAR(50) NOT NULL,
  old_data JSONB,
  new_data JSONB,
  changed_by BIGINT,
  changed_by_name VARCHAR(255),
  timestamp TIMESTAMP DEFAULT NOW()
);

-- Crear tabla party_comparison_snapshots
CREATE TABLE IF NOT EXISTS party_comparison_snapshots (
  id BIGSERIAL PRIMARY KEY,
  snapshot_date TIMESTAMP DEFAULT NOW(),
  party_key VARCHAR(255) NOT NULL REFERENCES party_configuration(party_key) ON DELETE CASCADE,
  configuration_data JSONB NOT NULL,
  statistics_data JSONB NOT NULL
);

-- Crear índices
CREATE INDEX IF NOT EXISTS idx_party_config_key ON party_configuration(party_key);
CREATE INDEX IF NOT EXISTS idx_party_stats_key ON party_statistics(party_key);
CREATE INDEX IF NOT EXISTS idx_party_history_key ON party_logo_history_v2(party_key);
CREATE INDEX IF NOT EXISTS idx_party_history_timestamp ON party_logo_history_v2(timestamp);
CREATE INDEX IF NOT EXISTS idx_party_changes_key ON party_changes_log(party_key);
CREATE INDEX IF NOT EXISTS idx_party_changes_timestamp ON party_changes_log(timestamp);
CREATE INDEX IF NOT EXISTS idx_party_snapshot_date ON party_comparison_snapshots(snapshot_date);

-- Crear vistas
CREATE OR REPLACE VIEW recent_party_changes AS
SELECT 
  ph.id,
  ph.party_key,
  ph.change_type,
  ph.old_display_name,
  ph.new_display_name,
  ph.changed_by_name,
  ph.timestamp,
  pc.display_name as current_display_name
FROM party_logo_history_v2 ph
LEFT JOIN party_configuration pc ON ph.party_key = pc.party_key
ORDER BY ph.timestamp DESC
LIMIT 100;

CREATE OR REPLACE VIEW party_change_summary AS
SELECT 
  party_key,
  change_type,
  COUNT(*) as change_count,
  MAX(timestamp) as last_change
FROM party_logo_history_v2
GROUP BY party_key, change_type
ORDER BY last_change DESC;
