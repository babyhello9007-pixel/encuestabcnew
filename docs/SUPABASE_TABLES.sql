-- ============================================================================
-- TABLAS SQL PARA SUPABASE - Persistencia y Auditoría de Partidos
-- ============================================================================
-- Ejecuta este SQL en el Supabase SQL Editor para crear todas las tablas necesarias

-- ============================================================================
-- 1. TABLA: party_configuration
-- ============================================================================
-- Almacena la configuración personalizada de cada partido (nombre, color, logo URL)
-- Persiste cambios realizados en el panel admin

CREATE TABLE IF NOT EXISTS party_configuration (
  id BIGSERIAL PRIMARY KEY,
  party_key VARCHAR(100) NOT NULL UNIQUE,
  display_name VARCHAR(255) NOT NULL,
  color VARCHAR(7) NOT NULL, -- Formato hex: #RRGGBB
  logo_url TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  party_type VARCHAR(20) NOT NULL, -- 'general' o 'youth'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by BIGINT, -- user id
  updated_by BIGINT -- user id
);

-- Índices para optimizar búsquedas
CREATE INDEX IF NOT EXISTS idx_party_config_key ON party_configuration(party_key);
CREATE INDEX IF NOT EXISTS idx_party_config_type ON party_configuration(party_type);
CREATE INDEX IF NOT EXISTS idx_party_config_active ON party_configuration(is_active);
CREATE INDEX IF NOT EXISTS idx_party_config_updated ON party_configuration(updated_at DESC);

-- ============================================================================
-- 2. TABLA: party_logo_history
-- ============================================================================
-- Registra todos los cambios de logos, nombres, colores y URLs
-- Permite auditoría completa y reversión de cambios

CREATE TABLE IF NOT EXISTS party_logo_history (
  id BIGSERIAL PRIMARY KEY,
  party_key VARCHAR(100) NOT NULL,
  change_type VARCHAR(20) NOT NULL, -- 'upload', 'edit', 'delete', 'revert'
  old_display_name VARCHAR(255),
  new_display_name VARCHAR(255),
  old_color VARCHAR(7),
  new_color VARCHAR(7),
  old_logo_url TEXT,
  new_logo_url TEXT,
  changed_by BIGINT, -- user id
  change_reason TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_reverted BOOLEAN DEFAULT false,
  reverted_by BIGINT, -- user id que revirtió
  reverted_at TIMESTAMP WITH TIME ZONE
);

-- Índices para auditoría
CREATE INDEX IF NOT EXISTS idx_party_history_key ON party_logo_history(party_key);
CREATE INDEX IF NOT EXISTS idx_party_history_timestamp ON party_logo_history(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_party_history_changed_by ON party_logo_history(changed_by);
CREATE INDEX IF NOT EXISTS idx_party_history_type ON party_logo_history(change_type);

-- ============================================================================
-- 3. TABLA: party_statistics
-- ============================================================================
-- Almacena estadísticas de uso de cada partido
-- Se actualiza automáticamente con cada voto

CREATE TABLE IF NOT EXISTS party_statistics (
  id BIGSERIAL PRIMARY KEY,
  party_key VARCHAR(100) NOT NULL UNIQUE,
  total_votes BIGINT DEFAULT 0,
  total_mentions BIGINT DEFAULT 0, -- Menciones en encuestas varias
  general_elections_votes BIGINT DEFAULT 0,
  autonomous_elections_votes BIGINT DEFAULT 0,
  municipal_elections_votes BIGINT DEFAULT 0,
  european_elections_votes BIGINT DEFAULT 0,
  youth_association_votes BIGINT DEFAULT 0,
  average_rating DECIMAL(3, 2) DEFAULT 0, -- 0-10
  total_ratings BIGINT DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para estadísticas
CREATE INDEX IF NOT EXISTS idx_party_stats_key ON party_statistics(party_key);
CREATE INDEX IF NOT EXISTS idx_party_stats_total_votes ON party_statistics(total_votes DESC);
CREATE INDEX IF NOT EXISTS idx_party_stats_last_updated ON party_statistics(last_updated DESC);

-- ============================================================================
-- 4. TABLA: party_changes_log
-- ============================================================================
-- Log detallado de todos los cambios para auditoría avanzada

CREATE TABLE IF NOT EXISTS party_changes_log (
  id BIGSERIAL PRIMARY KEY,
  party_key VARCHAR(100) NOT NULL,
  change_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  changed_by BIGINT, -- user id
  user_name VARCHAR(255),
  change_details JSONB, -- Almacena detalles completos del cambio
  ip_address INET, -- IP del usuario que hizo el cambio
  user_agent TEXT -- Navegador/cliente
);

-- Índices para búsqueda de cambios
CREATE INDEX IF NOT EXISTS idx_changes_log_party ON party_changes_log(party_key);
CREATE INDEX IF NOT EXISTS idx_changes_log_timestamp ON party_changes_log(change_timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_changes_log_user ON party_changes_log(changed_by);

-- ============================================================================
-- 5. TABLA: party_comparison_snapshots
-- ============================================================================
-- Snapshots de configuración de partidos en momentos específicos
-- Útil para comparar cambios a lo largo del tiempo

CREATE TABLE IF NOT EXISTS party_comparison_snapshots (
  id BIGSERIAL PRIMARY KEY,
  snapshot_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  party_key VARCHAR(100) NOT NULL,
  display_name VARCHAR(255) NOT NULL,
  color VARCHAR(7) NOT NULL,
  logo_url TEXT NOT NULL,
  total_votes BIGINT,
  average_rating DECIMAL(3, 2)
);

-- Índices para snapshots
CREATE INDEX IF NOT EXISTS idx_snapshots_date ON party_comparison_snapshots(snapshot_date DESC);
CREATE INDEX IF NOT EXISTS idx_snapshots_party ON party_comparison_snapshots(party_key);

-- ============================================================================
-- VISTAS SQL ÚTILES
-- ============================================================================

-- Vista: Últimos cambios de partidos (últimas 24 horas)
CREATE OR REPLACE VIEW recent_party_changes AS
SELECT 
  pc.party_key,
  pc.change_type,
  pc.new_display_name,
  pc.new_color,
  pc.new_logo_url,
  u.name as changed_by_name,
  pc.timestamp,
  pc.change_reason
FROM party_logo_history pc
LEFT JOIN users u ON pc.changed_by = u.id
WHERE pc.timestamp > NOW() - INTERVAL '24 hours'
ORDER BY pc.timestamp DESC;

-- Vista: Estadísticas de cambios por usuario
CREATE OR REPLACE VIEW user_change_statistics AS
SELECT 
  pc.changed_by,
  u.name as user_name,
  COUNT(*) as total_changes,
  COUNT(DISTINCT pc.party_key) as parties_modified,
  MAX(pc.timestamp) as last_change,
  ARRAY_AGG(DISTINCT pc.change_type) as change_types
FROM party_logo_history pc
LEFT JOIN users u ON pc.changed_by = u.id
WHERE pc.changed_by IS NOT NULL
GROUP BY pc.changed_by, u.name
ORDER BY total_changes DESC;

-- Vista: Partidos más cambiados
CREATE OR REPLACE VIEW most_changed_parties AS
SELECT 
  pc.party_key,
  COUNT(*) as total_changes,
  COUNT(DISTINCT pc.changed_by) as users_who_changed,
  MAX(pc.timestamp) as last_change,
  ARRAY_AGG(DISTINCT pc.change_type) as change_types
FROM party_logo_history pc
GROUP BY pc.party_key
ORDER BY total_changes DESC;

-- Vista: Comparación de estadísticas antes/después
CREATE OR REPLACE VIEW party_stats_comparison AS
SELECT 
  ps.party_key,
  ps.total_votes,
  ps.total_mentions,
  ps.average_rating,
  (ps.general_elections_votes + ps.autonomous_elections_votes + ps.municipal_elections_votes + ps.european_elections_votes) as total_election_votes,
  ps.youth_association_votes,
  ps.last_updated
FROM party_statistics ps
ORDER BY ps.total_votes DESC;

-- ============================================================================
-- TRIGGERS PARA AUDITORÍA AUTOMÁTICA
-- ============================================================================

-- Trigger: Actualizar updated_at en party_configuration
CREATE OR REPLACE FUNCTION update_party_config_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER party_config_update_timestamp
BEFORE UPDATE ON party_configuration
FOR EACH ROW
EXECUTE FUNCTION update_party_config_timestamp();

-- Trigger: Registrar cambios en party_logo_history
CREATE OR REPLACE FUNCTION log_party_config_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    INSERT INTO party_logo_history (
      party_key,
      change_type,
      old_display_name,
      new_display_name,
      old_color,
      new_color,
      old_logo_url,
      new_logo_url,
      changed_by,
      timestamp
    ) VALUES (
      NEW.party_key,
      'edit',
      OLD.display_name,
      NEW.display_name,
      OLD.color,
      NEW.color,
      OLD.logo_url,
      NEW.logo_url,
      NEW.updated_by,
      NOW()
    );
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO party_logo_history (
      party_key,
      change_type,
      old_display_name,
      old_color,
      old_logo_url,
      changed_by,
      timestamp
    ) VALUES (
      OLD.party_key,
      'delete',
      OLD.display_name,
      OLD.color,
      OLD.logo_url,
      OLD.updated_by,
      NOW()
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER party_config_log_changes
AFTER UPDATE OR DELETE ON party_configuration
FOR EACH ROW
EXECUTE FUNCTION log_party_config_changes();

-- ============================================================================
-- DATOS INICIALES
-- ============================================================================

-- Insertar configuración inicial de partidos (si no existen)
INSERT INTO party_configuration (party_key, display_name, color, logo_url, party_type)
SELECT 
  'PP',
  'Partido Popular',
  '#0066CC',
  'https://files.manuscdn.com/user_upload_by_module/session_file/310519663194390516/tTkePaUFEpyBEbYg.png',
  'general'
WHERE NOT EXISTS (SELECT 1 FROM party_configuration WHERE party_key = 'PP')
ON CONFLICT (party_key) DO NOTHING;

-- ============================================================================
-- PERMISOS Y SEGURIDAD
-- ============================================================================

-- Habilitar RLS (Row Level Security) si es necesario
-- ALTER TABLE party_configuration ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE party_logo_history ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE party_statistics ENABLE ROW LEVEL SECURITY;

-- Crear políticas de acceso (ejemplo - ajusta según tus necesidades)
-- CREATE POLICY "Allow admin to view all" ON party_configuration
--   FOR SELECT USING (auth.jwt() ->> 'role' = 'admin');

-- ============================================================================
-- NOTAS IMPORTANTES
-- ============================================================================
-- 1. Ejecuta este SQL en el Supabase SQL Editor
-- 2. Las tablas se crearán en el schema "public"
-- 3. Los triggers se ejecutarán automáticamente
-- 4. Las vistas están disponibles para consultas
-- 5. Asegúrate de que los usuarios tengan permisos adecuados
-- 6. Revisa las políticas de RLS según tus necesidades de seguridad
