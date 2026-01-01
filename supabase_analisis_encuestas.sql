-- ============================================================================
-- SCRIPT SQL PARA SUPABASE - ANÁLISIS DE ENCUESTAS EXTERNAS
-- ============================================================================
-- Este script crea todas las tablas, vistas e índices necesarios para el
-- sistema de análisis de encuestas externas integrado con Batalla Cultural
-- ============================================================================

-- ============================================================================
-- 1. TABLA: ENCUESTADORAS
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.encuestadoras (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  nombre VARCHAR(100) NOT NULL UNIQUE,
  sigla VARCHAR(20),
  pais VARCHAR(50) DEFAULT 'España',
  sitio_web TEXT,
  credibilidad INT CHECK (credibilidad >= 0 AND credibilidad <= 100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Índices para encuestadoras
CREATE INDEX IF NOT EXISTS idx_encuestadoras_nombre ON public.encuestadoras(nombre);
CREATE INDEX IF NOT EXISTS idx_encuestadoras_sigla ON public.encuestadoras(sigla);

-- RLS para encuestadoras (lectura pública)
ALTER TABLE public.encuestadoras ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Lectura pública de encuestadoras" ON public.encuestadoras
  FOR SELECT USING (true);

-- ============================================================================
-- 2. TABLA: ENCUESTAS_EXTERNAS
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
  tamano_muestra INT CHECK (tamano_muestra > 0),
  margen_error INT CHECK (margen_error >= 0 AND margen_error <= 100),
  metodologia TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
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
-- 3. TABLA: RESULTADOS_ENCUESTAS
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.resultados_encuestas (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  encuesta_id BIGINT NOT NULL REFERENCES public.encuestas_externas(id) ON DELETE CASCADE,
  partido_id VARCHAR(100) NOT NULL,
  votos INT,
  porcentaje INT CHECK (porcentaje >= 0 AND porcentaje <= 100),
  escanos INT CHECK (escanos >= 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
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
-- 4. TABLA: TENDENCIAS_AGREGADAS
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.tendencias_agregadas (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  partido_id VARCHAR(100) NOT NULL,
  tipo_encuesta VARCHAR(50) NOT NULL,
  ambito VARCHAR(50) NOT NULL,
  ccaa_o_provincia VARCHAR(100),
  fecha TIMESTAMP WITH TIME ZONE NOT NULL,
  media_7_dias INT CHECK (media_7_dias >= 0 AND media_7_dias <= 100),
  media_14_dias INT CHECK (media_14_dias >= 0 AND media_14_dias <= 100),
  media_30_dias INT CHECK (media_30_dias >= 0 AND media_30_dias <= 100),
  tendencia VARCHAR(20) CHECK (tendencia IN ('subida', 'bajada', 'estable')),
  cambio_7_dias INT CHECK (cambio_7_dias >= -100 AND cambio_7_dias <= 100),
  cambio_30_dias INT CHECK (cambio_30_dias >= -100 AND cambio_30_dias <= 100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
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
-- 5. VISTA: v_resultados_brutos
-- ============================================================================
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

-- ============================================================================
-- 6. VISTA: v_media_encuestas_por_fecha
-- ============================================================================
CREATE OR REPLACE VIEW public.v_media_encuestas_por_fecha AS
SELECT 
  DATE(ee.fecha_publicacion) AS fecha,
  ee.tipo_encuesta,
  ee.ambito,
  ee.ccaa_o_provincia,
  re.partido_id,
  ROUND(AVG(re.porcentaje::numeric), 2)::INT AS media_porcentaje,
  ROUND(AVG(re.escanos::numeric), 1)::INT AS media_escanos,
  COUNT(DISTINCT ee.id) AS num_encuestas
FROM public.resultados_encuestas re
JOIN public.encuestas_externas ee ON re.encuesta_id = ee.id
GROUP BY DATE(ee.fecha_publicacion), ee.tipo_encuesta, ee.ambito, ee.ccaa_o_provincia, re.partido_id
ORDER BY fecha DESC;

-- ============================================================================
-- 7. VISTA: v_tendencias_7_dias
-- ============================================================================
CREATE OR REPLACE VIEW public.v_tendencias_7_dias AS
SELECT 
  re.partido_id,
  ee.tipo_encuesta,
  ee.ambito,
  ee.ccaa_o_provincia,
  ROUND(AVG(CASE WHEN DATE(ee.fecha_publicacion) >= CURRENT_DATE - INTERVAL '7 days' THEN re.porcentaje::numeric END), 2)::INT AS media_7_dias,
  ROUND(AVG(CASE WHEN DATE(ee.fecha_publicacion) >= CURRENT_DATE - INTERVAL '14 days' AND DATE(ee.fecha_publicacion) < CURRENT_DATE - INTERVAL '7 days' THEN re.porcentaje::numeric END), 2)::INT AS media_anterior_7_dias,
  COUNT(DISTINCT ee.id) AS num_encuestas
FROM public.resultados_encuestas re
JOIN public.encuestas_externas ee ON re.encuesta_id = ee.id
WHERE ee.fecha_publicacion >= CURRENT_DATE - INTERVAL '14 days'
GROUP BY re.partido_id, ee.tipo_encuesta, ee.ambito, ee.ccaa_o_provincia;

-- ============================================================================
-- 8. VISTA: v_tendencias_30_dias
-- ============================================================================
CREATE OR REPLACE VIEW public.v_tendencias_30_dias AS
SELECT 
  re.partido_id,
  ee.tipo_encuesta,
  ee.ambito,
  ee.ccaa_o_provincia,
  ROUND(AVG(CASE WHEN DATE(ee.fecha_publicacion) >= CURRENT_DATE - INTERVAL '30 days' THEN re.porcentaje::numeric END), 2)::INT AS media_30_dias,
  ROUND(AVG(CASE WHEN DATE(ee.fecha_publicacion) >= CURRENT_DATE - INTERVAL '60 days' AND DATE(ee.fecha_publicacion) < CURRENT_DATE - INTERVAL '30 days' THEN re.porcentaje::numeric END), 2)::INT AS media_anterior_30_dias,
  COUNT(DISTINCT ee.id) AS num_encuestas
FROM public.resultados_encuestas re
JOIN public.encuestas_externas ee ON re.encuesta_id = ee.id
WHERE ee.fecha_publicacion >= CURRENT_DATE - INTERVAL '60 days'
GROUP BY re.partido_id, ee.tipo_encuesta, ee.ambito, ee.ccaa_o_provincia;

-- ============================================================================
-- 9. VISTA: v_comparativa_encuestadoras
-- ============================================================================
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

-- ============================================================================
-- 10. VISTA: v_ranking_partidos_media
-- ============================================================================
CREATE OR REPLACE VIEW public.v_ranking_partidos_media AS
SELECT 
  re.partido_id,
  ee.tipo_encuesta,
  ee.ambito,
  ee.ccaa_o_provincia,
  ROUND(AVG(re.porcentaje::numeric), 2)::INT AS media_porcentaje,
  ROUND(AVG(re.escanos::numeric), 1)::INT AS media_escanos,
  COUNT(DISTINCT ee.id) AS num_encuestas,
  RANK() OVER (PARTITION BY ee.tipo_encuesta, ee.ambito ORDER BY AVG(re.porcentaje::numeric) DESC) AS ranking
FROM public.resultados_encuestas re
JOIN public.encuestas_externas ee ON re.encuesta_id = ee.id
GROUP BY re.partido_id, ee.tipo_encuesta, ee.ambito, ee.ccaa_o_provincia
ORDER BY ranking;

-- ============================================================================
-- 11. VISTA: v_alertas_politicas
-- ============================================================================
CREATE OR REPLACE VIEW public.v_alertas_politicas AS
WITH cambios_recientes AS (
  SELECT 
    re.partido_id,
    ee.tipo_encuesta,
    ee.ambito,
    ee.ccaa_o_provincia,
    ROUND(AVG(CASE WHEN DATE(ee.fecha_publicacion) >= CURRENT_DATE - INTERVAL '7 days' THEN re.porcentaje::numeric END), 2) AS media_semana_actual,
    ROUND(AVG(CASE WHEN DATE(ee.fecha_publicacion) < CURRENT_DATE - INTERVAL '7 days' AND DATE(ee.fecha_publicacion) >= CURRENT_DATE - INTERVAL '14 days' THEN re.porcentaje::numeric END), 2) AS media_semana_anterior,
    COUNT(DISTINCT ee.id) AS num_encuestas
  FROM public.resultados_encuestas re
  JOIN public.encuestas_externas ee ON re.encuesta_id = ee.id
  WHERE ee.fecha_publicacion >= CURRENT_DATE - INTERVAL '14 days'
  GROUP BY re.partido_id, ee.tipo_encuesta, ee.ambito, ee.ccaa_o_provincia
),
cambios_calculados AS (
  SELECT 
    partido_id,
    tipo_encuesta,
    ambito,
    ccaa_o_provincia,
    media_semana_actual,
    media_semana_anterior,
    ROUND((media_semana_actual - media_semana_anterior), 2) AS cambio,
    num_encuestas
  FROM cambios_recientes
  WHERE media_semana_actual IS NOT NULL AND media_semana_anterior IS NOT NULL
)
SELECT 
  partido_id,
  tipo_encuesta,
  ambito,
  ccaa_o_provincia,
  media_semana_actual::INT AS media_semana_actual,
  media_semana_anterior::INT AS media_semana_anterior,
  cambio::INT AS cambio,
  CASE 
    WHEN ABS(cambio) > 3 THEN 'CAMBIO_SIGNIFICATIVO'
    WHEN ABS(cambio) > 1.5 THEN 'CAMBIO_MODERADO'
    WHEN ABS(cambio) > 0.5 THEN 'CAMBIO_LEVE'
    ELSE 'SIN_CAMBIO'
  END AS tipo_alerta,
  CASE 
    WHEN cambio > 0 THEN 'SUBIDA'
    WHEN cambio < 0 THEN 'BAJADA'
    ELSE 'ESTABLE'
  END AS direccion,
  num_encuestas
FROM cambios_calculados
ORDER BY ABS(cambio) DESC;

-- ============================================================================
-- 12. PERMISOS Y POLÍTICAS RLS
-- ============================================================================

-- Permitir lectura pública de todas las vistas
GRANT SELECT ON public.v_resultados_brutos TO anon, authenticated;
GRANT SELECT ON public.v_media_encuestas_por_fecha TO anon, authenticated;
GRANT SELECT ON public.v_tendencias_7_dias TO anon, authenticated;
GRANT SELECT ON public.v_tendencias_30_dias TO anon, authenticated;
GRANT SELECT ON public.v_comparativa_encuestadoras TO anon, authenticated;
GRANT SELECT ON public.v_ranking_partidos_media TO anon, authenticated;
GRANT SELECT ON public.v_alertas_politicas TO anon, authenticated;

-- Permitir lectura pública de tablas
GRANT SELECT ON public.encuestadoras TO anon, authenticated;
GRANT SELECT ON public.encuestas_externas TO anon, authenticated;
GRANT SELECT ON public.resultados_encuestas TO anon, authenticated;
GRANT SELECT ON public.tendencias_agregadas TO anon, authenticated;

-- ============================================================================
-- 13. DATOS DE EJEMPLO (OPCIONAL)
-- ============================================================================
-- Descomenta esta sección para insertar datos de ejemplo

/*
-- Insertar encuestadoras de ejemplo
INSERT INTO public.encuestadoras (nombre, sigla, pais, credibilidad) VALUES
('CIS - Centro de Investigaciones Sociológicas', 'CIS', 'España', 90),
('Metroscopia', 'METRO', 'España', 85),
('Sigma Dos', 'SD', 'España', 80),
('DYM - Demoscopia y Matrices', 'DYM', 'España', 75),
('Electomania', 'ELEC', 'España', 70),
('GAD3', 'GAD3', 'España', 80),
('Invymark', 'INVY', 'España', 70),
('Ikerfel', 'IKER', 'España', 65)
ON CONFLICT (nombre) DO NOTHING;

-- Insertar encuesta de ejemplo
INSERT INTO public.encuestas_externas 
(encuestadora_id, tipo_encuesta, ambito, fecha_publicacion, tamano_muestra, margen_error, metodologia)
SELECT id, 'generales', 'nacional', NOW() - INTERVAL '7 days', 1500, 3, 'Encuesta telefónica'
FROM public.encuestadoras WHERE nombre = 'CIS - Centro de Investigaciones Sociológicas'
LIMIT 1;

-- Insertar resultados de ejemplo
INSERT INTO public.resultados_encuestas (encuesta_id, partido_id, porcentaje, escanos)
SELECT id, 'PP', 25, 120 FROM public.encuestas_externas LIMIT 1;
INSERT INTO public.resultados_encuestas (encuesta_id, partido_id, porcentaje, escanos)
SELECT id, 'PSOE', 22, 110 FROM public.encuestas_externas LIMIT 1;
INSERT INTO public.resultados_encuestas (encuesta_id, partido_id, porcentaje, escanos)
SELECT id, 'VOX', 15, 45 FROM public.encuestas_externas LIMIT 1;
INSERT INTO public.resultados_encuestas (encuesta_id, partido_id, porcentaje, escanos)
SELECT id, 'Podemos', 12, 35 FROM public.encuestas_externas LIMIT 1;
INSERT INTO public.resultados_encuestas (encuesta_id, partido_id, porcentaje, escanos)
SELECT id, 'Ciudadanos', 8, 20 FROM public.encuestas_externas LIMIT 1;
*/

-- ============================================================================
-- FIN DEL SCRIPT
-- ============================================================================
-- Script completado. Todas las tablas, vistas e índices han sido creados.
-- Las políticas RLS están configuradas para lectura pública.
-- Descomenta la sección de datos de ejemplo para insertar datos de prueba.
-- ============================================================================
