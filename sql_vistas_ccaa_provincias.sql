-- ============================================================================
-- VISTAS PARA RESULTADOS POR CCAA Y PROVINCIAS
-- ============================================================================

-- ============================================================================
-- 1. VISTA: Votos Generales por CCAA
-- ============================================================================
CREATE OR REPLACE VIEW public.votos_generales_por_ccaa AS
SELECT 
  ccaa,
  voto_generales as partido,
  COUNT(*) as votos,
  ROUND((COUNT(*)::numeric / (SELECT COUNT(*) FROM public.respuestas WHERE ccaa IS NOT NULL AND ccaa != '' AND voto_generales IS NOT NULL AND voto_generales != '')) * 100, 2) as porcentaje,
  ROUND(AVG(COALESCE(edad, 18))::numeric, 1) as edad_promedio,
  ROUND(AVG(COALESCE(posicion_ideologica, 5))::numeric, 1) as ideologia_promedio
FROM public.respuestas
WHERE ccaa IS NOT NULL AND ccaa != '' AND voto_generales IS NOT NULL AND voto_generales != ''
GROUP BY ccaa, voto_generales
ORDER BY ccaa, votos DESC;

-- ============================================================================
-- 2. VISTA: Votos Autonómicos por CCAA
-- ============================================================================
CREATE OR REPLACE VIEW public.votos_autonomicas_por_ccaa AS
SELECT 
  ccaa,
  voto_autonomicas as partido,
  COUNT(*) as votos,
  ROUND((COUNT(*)::numeric / (SELECT COUNT(*) FROM public.respuestas WHERE ccaa IS NOT NULL AND ccaa != '' AND voto_autonomicas IS NOT NULL AND voto_autonomicas != '')) * 100, 2) as porcentaje,
  ROUND(AVG(COALESCE(edad, 18))::numeric, 1) as edad_promedio,
  ROUND(AVG(COALESCE(posicion_ideologica, 5))::numeric, 1) as ideologia_promedio
FROM public.respuestas
WHERE ccaa IS NOT NULL AND ccaa != '' AND voto_autonomicas IS NOT NULL AND voto_autonomicas != ''
GROUP BY ccaa, voto_autonomicas
ORDER BY ccaa, votos DESC;

-- ============================================================================
-- 3. VISTA: Votos Municipales por Provincia
-- ============================================================================
CREATE OR REPLACE VIEW public.votos_municipales_por_provincia AS
SELECT 
  provincia,
  voto_municipales as partido,
  COUNT(*) as votos,
  ROUND((COUNT(*)::numeric / (SELECT COUNT(*) FROM public.respuestas WHERE provincia IS NOT NULL AND provincia != '' AND voto_municipales IS NOT NULL AND voto_municipales != '')) * 100, 2) as porcentaje,
  ROUND(AVG(COALESCE(edad, 18))::numeric, 1) as edad_promedio,
  ROUND(AVG(COALESCE(posicion_ideologica, 5))::numeric, 1) as ideologia_promedio
FROM public.respuestas
WHERE provincia IS NOT NULL AND provincia != '' AND voto_municipales IS NOT NULL AND voto_municipales != ''
GROUP BY provincia, voto_municipales
ORDER BY provincia, votos DESC;

-- ============================================================================
-- 4. VISTA: Resumen de Votos Generales por CCAA (Totales)
-- ============================================================================
CREATE OR REPLACE VIEW public.resumen_votos_generales_por_ccaa AS
SELECT 
  ccaa,
  COUNT(*) as total_votos,
  COUNT(DISTINCT voto_generales) as num_partidos,
  ROUND(AVG(COALESCE(edad, 18))::numeric, 1) as edad_promedio,
  ROUND(AVG(COALESCE(posicion_ideologica, 5))::numeric, 1) as ideologia_promedio
FROM public.respuestas
WHERE ccaa IS NOT NULL AND ccaa != ''
GROUP BY ccaa
ORDER BY total_votos DESC;

-- ============================================================================
-- 5. VISTA: Resumen de Votos Municipales por Provincia (Totales)
-- ============================================================================
CREATE OR REPLACE VIEW public.resumen_votos_municipales_por_provincia AS
SELECT 
  provincia,
  COUNT(*) as total_votos,
  COUNT(DISTINCT voto_municipales) as num_partidos,
  ROUND(AVG(COALESCE(edad, 18))::numeric, 1) as edad_promedio,
  ROUND(AVG(COALESCE(posicion_ideologica, 5))::numeric, 1) as ideologia_promedio
FROM public.respuestas
WHERE provincia IS NOT NULL AND provincia != ''
GROUP BY provincia
ORDER BY total_votos DESC;

-- ============================================================================
-- PERMISOS RLS PARA LAS NUEVAS VISTAS
-- ============================================================================
-- Las vistas heredan los permisos de la tabla respuestas
-- Asegúrate de que la tabla respuestas tenga RLS habilitado y políticas públicas de lectura
