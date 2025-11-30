-- ============================================================================
-- VISTAS PARA ASOCIACIONES JUVENILES POR PROVINCIA
-- ============================================================================

-- Vista: Votos de Asociaciones Juveniles por Provincia
CREATE OR REPLACE VIEW public.votos_por_provincia_juveniles_view AS
SELECT 
  provincia,
  voto_asociacion_juvenil as asociacion,
  COUNT(*) as votos,
  ROUND((COUNT(*)::numeric / (SELECT COUNT(*) FROM public.respuestas WHERE provincia IS NOT NULL AND provincia != '' AND voto_asociacion_juvenil IS NOT NULL AND voto_asociacion_juvenil != '')) * 100, 2) as porcentaje,
  ROUND(AVG(COALESCE(edad, 18))::numeric, 1) as edad_promedio,
  ROUND(AVG(COALESCE(posicion_ideologica, 5))::numeric, 1) as ideologia_promedio
FROM public.respuestas
WHERE provincia IS NOT NULL AND provincia != '' AND voto_asociacion_juvenil IS NOT NULL AND voto_asociacion_juvenil != ''
GROUP BY provincia, voto_asociacion_juvenil
ORDER BY provincia, votos DESC;

-- Vista: Resumen de Votos de Asociaciones Juveniles por Provincia (Totales)
CREATE OR REPLACE VIEW public.resumen_votos_asociaciones_juveniles_por_provincia AS
SELECT 
  provincia,
  COUNT(*) as total_votos,
  COUNT(DISTINCT voto_asociacion_juvenil) as num_asociaciones,
  ROUND(AVG(COALESCE(edad, 18))::numeric, 1) as edad_promedio,
  ROUND(AVG(COALESCE(posicion_ideologica, 5))::numeric, 1) as ideologia_promedio
FROM public.respuestas
WHERE provincia IS NOT NULL AND provincia != '' AND voto_asociacion_juvenil IS NOT NULL AND voto_asociacion_juvenil != ''
GROUP BY provincia
ORDER BY total_votos DESC;

-- Vista: Votos Totales de Asociaciones Juveniles (Nacional)
CREATE OR REPLACE VIEW public.votos_totales_asociaciones_juveniles AS
SELECT 
  voto_asociacion_juvenil as asociacion,
  COUNT(*) as votos,
  ROUND((COUNT(*)::numeric / (SELECT COUNT(*) FROM public.respuestas WHERE voto_asociacion_juvenil IS NOT NULL AND voto_asociacion_juvenil != '')) * 100, 2) as porcentaje,
  ROUND(AVG(COALESCE(edad, 18))::numeric, 1) as edad_promedio,
  ROUND(AVG(COALESCE(posicion_ideologica, 5))::numeric, 1) as ideologia_promedio
FROM public.respuestas
WHERE voto_asociacion_juvenil IS NOT NULL AND voto_asociacion_juvenil != ''
GROUP BY voto_asociacion_juvenil
ORDER BY votos DESC;
