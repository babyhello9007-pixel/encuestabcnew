-- ============================================================================
-- SCRIPT SQL PARA SUPABASE - ENCUESTA BC
-- ============================================================================
-- Este script crea todas las tablas necesarias para el sistema de encuestas
-- Ejecuta este script en el SQL Editor de Supabase
-- ============================================================================

-- ============================================================================
-- 1. TABLA: ENCUESTADORAS (External Polling Organizations)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.encuestadoras (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  nombre VARCHAR(100) NOT NULL UNIQUE,
  sigla VARCHAR(20) UNIQUE,
  pais VARCHAR(50) DEFAULT 'España',
  sitio_web TEXT,
  credibilidad INTEGER CHECK (credibilidad >= 0 AND credibilidad <= 100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Índices para encuestadoras
CREATE INDEX IF NOT EXISTS idx_encuestadoras_nombre ON public.encuestadoras(nombre);
CREATE INDEX IF NOT EXISTS idx_encuestadoras_sigla ON public.encuestadoras(sigla);

-- RLS para encuestadoras (lectura pública)
ALTER TABLE public.encuestadoras ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Lectura pública de encuestadoras" ON public.encuestadoras
  FOR SELECT USING (true);

-- ============================================================================
-- 2. TABLA: ENCUESTAS_EXTERNAS (External Surveys)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.encuestas_externas (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  encuestadora_id BIGINT NOT NULL REFERENCES public.encuestadoras(id) ON DELETE CASCADE,
  tipo_encuesta VARCHAR(50) NOT NULL CHECK (tipo_encuesta IN ('generales', 'autonomicas', 'municipales', 'europeas')),
  ambito VARCHAR(50) NOT NULL CHECK (ambito IN ('nacional', 'ccaa', 'provincia')),
  ccaa_o_provincia VARCHAR(100),
  fecha_publicacion TIMESTAMP WITH TIME ZONE NOT NULL,
  fecha_encuesta_inicio TIMESTAMP WITH TIME ZONE,
  fecha_encuesta_fin TIMESTAMP WITH TIME ZONE,
  tamano_muestra INTEGER CHECK (tamano_muestra > 0),
  margen_error INTEGER CHECK (margen_error >= 0 AND margen_error <= 100),
  metodologia TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Índices para encuestas_externas
CREATE INDEX IF NOT EXISTS idx_encuestas_externas_fecha ON public.encuestas_externas(fecha_publicacion);
CREATE INDEX IF NOT EXISTS idx_encuestas_externas_tipo ON public.encuestas_externas(tipo_encuesta);
CREATE INDEX IF NOT EXISTS idx_encuestas_externas_ambito ON public.encuestas_externas(ambito);
CREATE INDEX IF NOT EXISTS idx_encuestas_externas_encuestadora ON public.encuestas_externas(encuestadora_id);
CREATE INDEX IF NOT EXISTS idx_encuestas_externas_ccaa_provincia ON public.encuestas_externas(ccaa_o_provincia);

-- RLS para encuestas_externas (lectura pública)
ALTER TABLE public.encuestas_externas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Lectura pública de encuestas externas" ON public.encuestas_externas
  FOR SELECT USING (true);

-- ============================================================================
-- 3. TABLA: RESULTADOS_ENCUESTAS (Survey Results)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.resultados_encuestas (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  encuesta_id BIGINT NOT NULL REFERENCES public.encuestas_externas(id) ON DELETE CASCADE,
  partido_id VARCHAR(100) NOT NULL,
  votos INTEGER,
  porcentaje INTEGER CHECK (porcentaje >= 0 AND porcentaje <= 100),
  escanos INTEGER CHECK (escanos >= 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(encuesta_id, partido_id)
);

-- Índices para resultados_encuestas
CREATE INDEX IF NOT EXISTS idx_resultados_encuestas_partido ON public.resultados_encuestas(partido_id);
CREATE INDEX IF NOT EXISTS idx_resultados_encuestas_encuesta ON public.resultados_encuestas(encuesta_id);

-- RLS para resultados_encuestas (lectura pública)
ALTER TABLE public.resultados_encuestas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Lectura pública de resultados de encuestas" ON public.resultados_encuestas
  FOR SELECT USING (true);

-- ============================================================================
-- 4. TABLA: TENDENCIAS_AGREGADAS (Aggregated Trends)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.tendencias_agregadas (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  partido_id VARCHAR(100) NOT NULL,
  tipo_encuesta VARCHAR(50) NOT NULL,
  ambito VARCHAR(50) NOT NULL,
  ccaa_o_provincia VARCHAR(100),
  fecha TIMESTAMP WITH TIME ZONE NOT NULL,
  media_7_dias INTEGER CHECK (media_7_dias >= 0 AND media_7_dias <= 100),
  media_14_dias INTEGER CHECK (media_14_dias >= 0 AND media_14_dias <= 100),
  media_30_dias INTEGER CHECK (media_30_dias >= 0 AND media_30_dias <= 100),
  tendencia VARCHAR(20) CHECK (tendencia IN ('subida', 'bajada', 'estable')),
  cambio_7_dias INTEGER CHECK (cambio_7_dias >= -100 AND cambio_7_dias <= 100),
  cambio_30_dias INTEGER CHECK (cambio_30_dias >= -100 AND cambio_30_dias <= 100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(partido_id, tipo_encuesta, ambito, ccaa_o_provincia, fecha)
);

-- Índices para tendencias_agregadas
CREATE INDEX IF NOT EXISTS idx_tendencias_agregadas_partido ON public.tendencias_agregadas(partido_id);
CREATE INDEX IF NOT EXISTS idx_tendencias_agregadas_fecha ON public.tendencias_agregadas(fecha);
CREATE INDEX IF NOT EXISTS idx_tendencias_agregadas_tipo ON public.tendencias_agregadas(tipo_encuesta);

-- RLS para tendencias_agregadas (lectura pública)
ALTER TABLE public.tendencias_agregadas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Lectura pública de tendencias agregadas" ON public.tendencias_agregadas
  FOR SELECT USING (true);

-- ============================================================================
-- 5. VISTAS PARA ANÁLISIS
-- ============================================================================

-- Vista: Resultados brutos con información de encuestadora
CREATE OR REPLACE VIEW public.v_resultados_brutos AS
SELECT 
  ee.id AS encuesta_id,
  e.nombre AS encuestadora,
  e.sigla AS sigla_encuestadora,
  ee.tipo_encuesta,
  ee.ambito,
  ee.ccaa_o_provincia,
  ee.fecha_publicacion,
  ee.tamano_muestra,
  ee.margen_error,
  re.partido_id,
  re.votos,
  re.porcentaje,
  re.escanos
FROM public.resultados_encuestas re
JOIN public.encuestas_externas ee ON re.encuesta_id = ee.id
JOIN public.encuestadoras e ON ee.encuestadora_id = e.id
ORDER BY ee.fecha_publicacion DESC, re.porcentaje DESC;

-- Vista: Media de encuestas por fecha
CREATE OR REPLACE VIEW public.v_media_encuestas_por_fecha AS
SELECT 
  DATE(ee.fecha_publicacion) AS fecha,
  ee.tipo_encuesta,
  ee.ambito,
  ee.ccaa_o_provincia,
  re.partido_id,
  ROUND(AVG(re.porcentaje::numeric), 2)::INTEGER AS media_porcentaje,
  ROUND(AVG(re.escanos::numeric), 1)::INTEGER AS media_escanos,
  COUNT(DISTINCT ee.id) AS num_encuestas
FROM public.resultados_encuestas re
JOIN public.encuestas_externas ee ON re.encuesta_id = ee.id
GROUP BY DATE(ee.fecha_publicacion), ee.tipo_encuesta, ee.ambito, ee.ccaa_o_provincia, re.partido_id
ORDER BY fecha DESC;

-- Vista: Tendencias últimos 7 días
CREATE OR REPLACE VIEW public.v_tendencias_7_dias AS
SELECT 
  re.partido_id,
  ee.tipo_encuesta,
  ee.ambito,
  ee.ccaa_o_provincia,
  ROUND(AVG(CASE WHEN DATE(ee.fecha_publicacion) >= CURRENT_DATE - INTERVAL '7 days' THEN re.porcentaje::numeric END), 2)::INTEGER AS media_7_dias,
  ROUND(AVG(CASE WHEN DATE(ee.fecha_publicacion) >= CURRENT_DATE - INTERVAL '14 days' AND DATE(ee.fecha_publicacion) < CURRENT_DATE - INTERVAL '7 days' THEN re.porcentaje::numeric END), 2)::INTEGER AS media_anterior_7_dias,
  COUNT(DISTINCT ee.id) AS num_encuestas
FROM public.resultados_encuestas re
JOIN public.encuestas_externas ee ON re.encuesta_id = ee.id
WHERE ee.fecha_publicacion >= CURRENT_DATE - INTERVAL '14 days'
GROUP BY re.partido_id, ee.tipo_encuesta, ee.ambito, ee.ccaa_o_provincia;

-- Vista: Tendencias últimos 30 días
CREATE OR REPLACE VIEW public.v_tendencias_30_dias AS
SELECT 
  re.partido_id,
  ee.tipo_encuesta,
  ee.ambito,
  ee.ccaa_o_provincia,
  ROUND(AVG(CASE WHEN DATE(ee.fecha_publicacion) >= CURRENT_DATE - INTERVAL '30 days' THEN re.porcentaje::numeric END), 2)::INTEGER AS media_30_dias,
  ROUND(AVG(CASE WHEN DATE(ee.fecha_publicacion) >= CURRENT_DATE - INTERVAL '60 days' AND DATE(ee.fecha_publicacion) < CURRENT_DATE - INTERVAL '30 days' THEN re.porcentaje::numeric END), 2)::INTEGER AS media_anterior_30_dias,
  COUNT(DISTINCT ee.id) AS num_encuestas
FROM public.resultados_encuestas re
JOIN public.encuestas_externas ee ON re.encuesta_id = ee.id
WHERE ee.fecha_publicacion >= CURRENT_DATE - INTERVAL '60 days'
GROUP BY re.partido_id, ee.tipo_encuesta, ee.ambito, ee.ccaa_o_provincia;

-- Vista: Comparativa de encuestadoras
CREATE OR REPLACE VIEW public.v_comparativa_encuestadoras AS
SELECT 
  e.nombre AS encuestadora,
  e.sigla AS sigla_encuestadora,
  ee.tipo_encuesta,
  ee.ambito,
  ee.ccaa_o_provincia,
  ee.fecha_publicacion,
  re.partido_id,
  re.porcentaje,
  re.escanos,
  RANK() OVER (PARTITION BY ee.tipo_encuesta, ee.ambito ORDER BY ee.fecha_publicacion DESC) AS rango_fecha
FROM public.resultados_encuestas re
JOIN public.encuestas_externas ee ON re.encuesta_id = ee.id
JOIN public.encuestadoras e ON ee.encuestadora_id = e.id
ORDER BY ee.fecha_publicacion DESC, e.nombre;

-- Vista: Ranking de partidos por media
CREATE OR REPLACE VIEW public.v_ranking_partidos_media AS
SELECT 
  re.partido_id,
  ee.tipo_encuesta,
  ee.ambito,
  ee.ccaa_o_provincia,
  ROUND(AVG(re.porcentaje::numeric), 2)::INTEGER AS media_porcentaje,
  ROUND(AVG(re.escanos::numeric), 1)::INTEGER AS media_escanos,
  COUNT(DISTINCT ee.id) AS num_encuestas,
  RANK() OVER (PARTITION BY ee.tipo_encuesta, ee.ambito ORDER BY AVG(re.porcentaje::numeric) DESC) AS ranking
FROM public.resultados_encuestas re
JOIN public.encuestas_externas ee ON re.encuesta_id = ee.id
GROUP BY re.partido_id, ee.tipo_encuesta, ee.ambito, ee.ccaa_o_provincia
ORDER BY ranking;

-- ============================================================================
-- FIN DEL SCRIPT
-- ============================================================================
