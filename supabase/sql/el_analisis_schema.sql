-- ============================================================================
-- SCHEMA PARA "EL ANÁLISIS" - Sistema de Agregación de Encuestas
-- Ejecutar directamente en Supabase SQL Editor
-- ============================================================================

-- Tabla de encuestadoras (CIS, GAD3, Sigma Dos, 40dB, BC, etc.)
CREATE TABLE IF NOT EXISTS encuestadoras (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre VARCHAR(255) NOT NULL,
  nombre_corto VARCHAR(50) NOT NULL UNIQUE,
  descripcion TEXT,
  website VARCHAR(255),
  logo_url TEXT,
  -- Tipos: 'externa' (CIS, GAD3, etc.) o 'propia' (Batalla Cultural)
  tipo VARCHAR(20) NOT NULL DEFAULT 'externa' CHECK (tipo IN ('externa', 'propia')),
  activa BOOLEAN DEFAULT TRUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Tabla de encuestas (metadatos de cada encuesta)
CREATE TABLE IF NOT EXISTS encuestas_externas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  encuestadora_id UUID NOT NULL REFERENCES encuestadoras(id) ON DELETE CASCADE,
  nombre VARCHAR(255) NOT NULL,
  descripcion TEXT,
  -- Tipos: 'generales', 'autonomicas', 'municipales', 'europeas'
  tipo_encuesta VARCHAR(20) NOT NULL DEFAULT 'generales' CHECK (tipo_encuesta IN ('generales', 'autonomicas', 'municipales', 'europeas')),
  -- Ámbito: 'nacional', 'autonomico', 'provincial'
  ambito VARCHAR(20) NOT NULL DEFAULT 'nacional' CHECK (ambito IN ('nacional', 'autonomico', 'provincial')),
  -- Para encuestas autonómicas o provinciales
  ccaa_o_provincia VARCHAR(100),
  -- Fecha de realización de la encuesta
  fecha_realizacion TIMESTAMP NOT NULL,
  -- Fecha de publicación
  fecha_publicacion TIMESTAMP NOT NULL,
  -- Número de encuestados
  muestra INTEGER,
  -- Margen de error (en porcentaje)
  margen_error NUMERIC(5, 2),
  -- URL de la encuesta
  url_fuente TEXT,
  -- Notas adicionales
  notas TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Tabla de resultados de encuestas (votos por partido)
CREATE TABLE IF NOT EXISTS resultados_encuestas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  encuesta_id UUID NOT NULL REFERENCES encuestas_externas(id) ON DELETE CASCADE,
  partido_id VARCHAR(64) NOT NULL,
  -- Votos o porcentaje
  votos INTEGER,
  porcentaje NUMERIC(5, 2),
  -- Escaños (si está disponible)
  escanos INTEGER,
  -- Intención de voto (para encuestas de intención, no resultados reales)
  intencion_voto NUMERIC(5, 2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Tabla de tendencias agregadas (media de encuestas por partido)
CREATE TABLE IF NOT EXISTS tendencias_agregadas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partido_id VARCHAR(64) NOT NULL,
  tipo_encuesta VARCHAR(20) NOT NULL DEFAULT 'generales' CHECK (tipo_encuesta IN ('generales', 'autonomicas', 'municipales', 'europeas')),
  ambito VARCHAR(20) NOT NULL DEFAULT 'nacional' CHECK (ambito IN ('nacional', 'autonomico', 'provincial')),
  ccaa_o_provincia VARCHAR(100),
  -- Fecha de cálculo
  fecha TIMESTAMP NOT NULL,
  -- Media de votos/porcentaje
  media_votos NUMERIC(8, 2),
  media_intencion_voto NUMERIC(5, 2),
  -- Tendencia (cambio respecto a período anterior)
  tendencia_7_dias NUMERIC(5, 2),
  tendencia_14_dias NUMERIC(5, 2),
  tendencia_30_dias NUMERIC(5, 2),
  -- Número de encuestas incluidas en la media
  num_encuestas INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- ============================================================================
-- VISTAS SQL PARA AGREGACIÓN Y TENDENCIAS
-- ============================================================================

-- Vista: Resultados brutos por encuesta y partido
CREATE OR REPLACE VIEW v_resultados_brutos AS
SELECT 
  re.id,
  ee.nombre AS encuesta_nombre,
  e.nombre_corto AS encuestadora,
  e.tipo AS encuestadora_tipo,
  re.partido_id,
  re.votos,
  re.porcentaje,
  re.escanos,
  re.intencion_voto,
  ee.tipo_encuesta,
  ee.ambito,
  ee.ccaa_o_provincia,
  ee.fecha_realizacion,
  ee.fecha_publicacion,
  ee.muestra,
  ee.margen_error,
  ee.url_fuente
FROM resultados_encuestas re
JOIN encuestas_externas ee ON re.encuesta_id = ee.id
JOIN encuestadoras e ON ee.encuestadora_id = e.id
ORDER BY ee.fecha_publicacion DESC, re.partido_id;

-- Vista: Media de encuestas por partido y fecha
CREATE OR REPLACE VIEW v_media_encuestas_por_fecha AS
SELECT 
  DATE(ee.fecha_publicacion) AS fecha,
  re.partido_id,
  ee.tipo_encuesta,
  ee.ambito,
  ee.ccaa_o_provincia,
  COUNT(DISTINCT ee.id) AS num_encuestas,
  ROUND(AVG(re.porcentaje)::NUMERIC, 2) AS media_porcentaje,
  ROUND(AVG(re.intencion_voto)::NUMERIC, 2) AS media_intencion_voto,
  ROUND(AVG(re.votos)::NUMERIC, 2) AS media_votos,
  MIN(re.porcentaje) AS min_porcentaje,
  MAX(re.porcentaje) AS max_porcentaje
FROM resultados_encuestas re
JOIN encuestas_externas ee ON re.encuesta_id = ee.id
GROUP BY DATE(ee.fecha_publicacion), re.partido_id, ee.tipo_encuesta, ee.ambito, ee.ccaa_o_provincia
ORDER BY fecha DESC, re.partido_id;

-- Vista: Tendencias últimos 7 días
CREATE OR REPLACE VIEW v_tendencias_7_dias AS
WITH fechas_recientes AS (
  SELECT DISTINCT DATE(fecha_publicacion) AS fecha
  FROM encuestas_externas
  WHERE fecha_publicacion >= CURRENT_DATE - INTERVAL '7 days'
  ORDER BY fecha DESC
  LIMIT 2
)
SELECT 
  re.partido_id,
  ee.tipo_encuesta,
  ee.ambito,
  ee.ccaa_o_provincia,
  ROUND(AVG(CASE WHEN DATE(ee.fecha_publicacion) = (SELECT MAX(fecha) FROM fechas_recientes) THEN re.porcentaje END)::NUMERIC, 2) AS media_actual,
  ROUND(AVG(CASE WHEN DATE(ee.fecha_publicacion) < (SELECT MAX(fecha) FROM fechas_recientes) THEN re.porcentaje END)::NUMERIC, 2) AS media_anterior,
  ROUND((AVG(CASE WHEN DATE(ee.fecha_publicacion) = (SELECT MAX(fecha) FROM fechas_recientes) THEN re.porcentaje END) - 
          AVG(CASE WHEN DATE(ee.fecha_publicacion) < (SELECT MAX(fecha) FROM fechas_recientes) THEN re.porcentaje END))::NUMERIC, 2) AS tendencia
FROM resultados_encuestas re
JOIN encuestas_externas ee ON re.encuesta_id = ee.id
WHERE ee.fecha_publicacion >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY re.partido_id, ee.tipo_encuesta, ee.ambito, ee.ccaa_o_provincia;

-- Vista: Tendencias últimos 30 días
CREATE OR REPLACE VIEW v_tendencias_30_dias AS
WITH fechas_extremos AS (
  SELECT 
    MIN(DATE(fecha_publicacion)) AS fecha_inicio,
    MAX(DATE(fecha_publicacion)) AS fecha_fin
  FROM encuestas_externas
  WHERE fecha_publicacion >= CURRENT_DATE - INTERVAL '30 days'
)
SELECT 
  re.partido_id,
  ee.tipo_encuesta,
  ee.ambito,
  ee.ccaa_o_provincia,
  ROUND(AVG(CASE WHEN DATE(ee.fecha_publicacion) >= (SELECT fecha_fin - INTERVAL '7 days' FROM fechas_extremos) THEN re.porcentaje END)::NUMERIC, 2) AS media_reciente,
  ROUND(AVG(CASE WHEN DATE(ee.fecha_publicacion) < (SELECT fecha_inicio + INTERVAL '7 days' FROM fechas_extremos) THEN re.porcentaje END)::NUMERIC, 2) AS media_antigua,
  ROUND((AVG(CASE WHEN DATE(ee.fecha_publicacion) >= (SELECT fecha_fin - INTERVAL '7 days' FROM fechas_extremos) THEN re.porcentaje END) - 
          AVG(CASE WHEN DATE(ee.fecha_publicacion) < (SELECT fecha_inicio + INTERVAL '7 days' FROM fechas_extremos) THEN re.porcentaje END))::NUMERIC, 2) AS tendencia
FROM resultados_encuestas re
JOIN encuestas_externas ee ON re.encuesta_id = ee.id
WHERE ee.fecha_publicacion >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY re.partido_id, ee.tipo_encuesta, ee.ambito, ee.ccaa_o_provincia;

-- Vista: Comparativa de encuestadoras (últimas encuestas)
CREATE OR REPLACE VIEW v_comparativa_encuestadoras AS
SELECT 
  e.nombre_corto,
  e.tipo,
  re.partido_id,
  re.porcentaje,
  re.intencion_voto,
  ee.fecha_publicacion,
  ee.tipo_encuesta,
  ROW_NUMBER() OVER (PARTITION BY e.id, re.partido_id ORDER BY ee.fecha_publicacion DESC) AS posicion
FROM resultados_encuestas re
JOIN encuestas_externas ee ON re.encuesta_id = ee.id
JOIN encuestadoras e ON ee.encuestadora_id = e.id
WHERE ee.fecha_publicacion >= CURRENT_DATE - INTERVAL '30 days'
ORDER BY e.nombre_corto, re.partido_id, ee.fecha_publicacion DESC;

-- Vista: Ranking de partidos por media de encuestas
CREATE OR REPLACE VIEW v_ranking_partidos_media AS
SELECT 
  re.partido_id,
  ee.tipo_encuesta,
  ee.ambito,
  ee.ccaa_o_provincia,
  COUNT(DISTINCT ee.id) AS num_encuestas,
  ROUND(AVG(re.porcentaje)::NUMERIC, 2) AS media_porcentaje,
  ROUND(AVG(re.intencion_voto)::NUMERIC, 2) AS media_intencion_voto,
  ROUND(STDDEV(re.porcentaje)::NUMERIC, 2) AS desviacion_porcentaje,
  ROW_NUMBER() OVER (PARTITION BY ee.tipo_encuesta, ee.ambito, ee.ccaa_o_provincia ORDER BY AVG(re.porcentaje) DESC) AS ranking
FROM resultados_encuestas re
JOIN encuestas_externas ee ON re.encuesta_id = ee.id
WHERE ee.fecha_publicacion >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY re.partido_id, ee.tipo_encuesta, ee.ambito, ee.ccaa_o_provincia
ORDER BY ee.tipo_encuesta, ee.ambito, media_porcentaje DESC;

-- Vista: Alertas políticas (cambios significativos)
CREATE OR REPLACE VIEW v_alertas_politicas AS
WITH cambios_recientes AS (
  SELECT 
    re.partido_id,
    ee.tipo_encuesta,
    ee.ambito,
    ee.ccaa_o_provincia,
    ROUND(AVG(CASE WHEN DATE(ee.fecha_publicacion) >= CURRENT_DATE - INTERVAL '7 days' THEN re.porcentaje END)::NUMERIC, 2) AS media_semana_actual,
    ROUND(AVG(CASE WHEN DATE(ee.fecha_publicacion) < CURRENT_DATE - INTERVAL '7 days' AND DATE(ee.fecha_publicacion) >= CURRENT_DATE - INTERVAL '14 days' THEN re.porcentaje END)::NUMERIC, 2) AS media_semana_anterior,
    COUNT(DISTINCT ee.id) AS num_encuestas
  FROM resultados_encuestas re
  JOIN encuestas_externas ee ON re.encuesta_id = ee.id
  WHERE ee.fecha_publicacion >= CURRENT_DATE - INTERVAL '14 days'
  GROUP BY re.partido_id, ee.tipo_encuesta, ee.ambito, ee.ccaa_o_provincia
)
SELECT 
  partido_id,
  tipo_encuesta,
  ambito,
  ccaa_o_provincia,
  media_semana_actual,
  media_semana_anterior,
  ROUND((media_semana_actual - media_semana_anterior)::NUMERIC, 2) AS cambio,
  CASE 
    WHEN ABS(media_semana_actual - media_semana_anterior) > 3 THEN 'CAMBIO_SIGNIFICATIVO'
    WHEN ABS(media_semana_actual - media_semana_anterior) > 1.5 THEN 'CAMBIO_MODERADO'
    WHEN ABS(media_semana_actual - media_semana_anterior) > 0.5 THEN 'CAMBIO_LEVE'
    ELSE 'SIN_CAMBIO'
  END AS tipo_alerta,
  CASE 
    WHEN media_semana_actual > media_semana_anterior THEN 'SUBIDA'
    WHEN media_semana_actual < media_semana_anterior THEN 'BAJADA'
    ELSE 'ESTABLE'
  END AS direccion,
  num_encuestas
FROM cambios_recientes
WHERE media_semana_actual IS NOT NULL AND media_semana_anterior IS NOT NULL
ORDER BY ABS(cambio) DESC;

-- ============================================================================
-- ÍNDICES PARA OPTIMIZACIÓN
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_encuestas_externas_fecha ON encuestas_externas(fecha_publicacion);
CREATE INDEX IF NOT EXISTS idx_encuestas_externas_tipo ON encuestas_externas(tipo_encuesta, ambito);
CREATE INDEX IF NOT EXISTS idx_resultados_encuestas_partido ON resultados_encuestas(partido_id);
CREATE INDEX IF NOT EXISTS idx_resultados_encuestas_encuesta ON resultados_encuestas(encuesta_id);
CREATE INDEX IF NOT EXISTS idx_tendencias_agregadas_partido ON tendencias_agregadas(partido_id, fecha);
CREATE INDEX IF NOT EXISTS idx_tendencias_agregadas_tipo ON tendencias_agregadas(tipo_encuesta, ambito);

-- ============================================================================
-- DATOS INICIALES - Encuestadoras principales
-- ============================================================================

INSERT INTO encuestadoras (nombre, nombre_corto, descripcion, tipo, activa)
VALUES 
  ('Centro de Investigaciones Sociológicas', 'CIS', 'Organismo público español de investigación sociológica', 'externa', TRUE),
  ('GAD3', 'GAD3', 'Empresa de investigación de mercado y sondeos electorales', 'externa', TRUE),
  ('Sigma Dos', 'Sigma Dos', 'Instituto de investigación y consultoría política', 'externa', TRUE),
  ('40dB', '40dB', 'Empresa de investigación de mercado y sondeos', 'externa', TRUE),
  ('Metroscopia', 'Metroscopia', 'Consultora especializada en sondeos electorales', 'externa', TRUE),
  ('Invymark', 'Invymark', 'Instituto de investigación de mercado', 'externa', TRUE),
  ('Batalla Cultural', 'BC', 'Encuestadora propia de Batalla Cultural', 'propia', TRUE)
ON CONFLICT (nombre_corto) DO NOTHING;

-- ============================================================================
-- FIN DEL SCHEMA
-- ============================================================================
