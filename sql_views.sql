-- VIEW para contar el total de respuestas
CREATE OR REPLACE VIEW public.total_respuestas_view AS
SELECT COUNT(*) as total_respuestas
FROM public.respuestas;

-- VIEW para calcular la valoración media de cada líder
CREATE OR REPLACE VIEW public.valoraciones_lideres_view AS
SELECT 
  'feijoo' as lider,
  ROUND(AVG(CAST(val_feijoo AS NUMERIC)), 1) as valoracion_media,
  COUNT(CASE WHEN val_feijoo IS NOT NULL THEN 1 END) as total_valoraciones
FROM public.respuestas
UNION ALL
SELECT 
  'sanchez' as lider,
  ROUND(AVG(CAST(val_sanchez AS NUMERIC)), 1) as valoracion_media,
  COUNT(CASE WHEN val_sanchez IS NOT NULL THEN 1 END) as total_valoraciones
FROM public.respuestas
UNION ALL
SELECT 
  'abascal' as lider,
  ROUND(AVG(CAST(val_abascal AS NUMERIC)), 1) as valoracion_media,
  COUNT(CASE WHEN val_abascal IS NOT NULL THEN 1 END) as total_valoraciones
FROM public.respuestas
UNION ALL
SELECT 
  'alvise' as lider,
  ROUND(AVG(CAST(val_alvise AS NUMERIC)), 1) as valoracion_media,
  COUNT(CASE WHEN val_alvise IS NOT NULL THEN 1 END) as total_valoraciones
FROM public.respuestas
UNION ALL
SELECT 
  'yolanda_diaz' as lider,
  ROUND(AVG(CAST(val_yolanda_diaz AS NUMERIC)), 1) as valoracion_media,
  COUNT(CASE WHEN val_yolanda_diaz IS NOT NULL THEN 1 END) as total_valoraciones
FROM public.respuestas
UNION ALL
SELECT 
  'irene_montero' as lider,
  ROUND(AVG(CAST(val_irene_montero AS NUMERIC)), 1) as valoracion_media,
  COUNT(CASE WHEN val_irene_montero IS NOT NULL THEN 1 END) as total_valoraciones
FROM public.respuestas
UNION ALL
SELECT 
  'ayuso' as lider,
  ROUND(AVG(CAST(val_ayuso AS NUMERIC)), 1) as valoracion_media,
  COUNT(CASE WHEN val_ayuso IS NOT NULL THEN 1 END) as total_valoraciones
FROM public.respuestas
UNION ALL
SELECT 
  'buxade' as lider,
  ROUND(AVG(CAST(val_buxade AS NUMERIC)), 1) as valoracion_media,
  COUNT(CASE WHEN val_buxade IS NOT NULL THEN 1 END) as total_valoraciones
FROM public.respuestas;

-- ============================================================================
-- NUEVOS VIEWS PARA MÉTRICAS DE EDAD E IDEOLOGÍA
-- ============================================================================

-- VIEW: Edad promedio global
CREATE OR REPLACE VIEW public.edad_promedio AS
SELECT 
  ROUND(AVG(COALESCE(edad, 18))::numeric, 1) as edad_media,
  COUNT(*) as total_respuestas
FROM public.respuestas;

-- VIEW: Ideología promedio global
CREATE OR REPLACE VIEW public.ideologia_promedio AS
SELECT 
  ROUND(AVG(COALESCE(posicion_ideologica, 5))::numeric, 1) as ideologia_media,
  COUNT(*) as total_respuestas
FROM public.respuestas;

-- VIEW: Edad e ideología por partido
CREATE OR REPLACE VIEW public.edad_ideologia_por_partido AS
SELECT 
  CASE 
    WHEN voto_general = 'PP' THEN 'PP'
    WHEN voto_general = 'PSOE' THEN 'PSOE'
    WHEN voto_general = 'VOX' THEN 'VOX'
    WHEN voto_general = 'Podemos' THEN 'PODEMOS'
    WHEN voto_general = 'Ciudadanos' THEN 'Ciudadanos'
    WHEN voto_general = 'Se Acabó La Fiesta' THEN 'Se Acabó La Fiesta'
    WHEN voto_general = 'SUMAR' THEN 'SUMAR'
    WHEN voto_general = 'Aliança Catalana' THEN 'Aliança Catalana'
    WHEN voto_general = 'Escaños en Blanco' THEN 'Escaños en Blanco'
    WHEN voto_general = 'Otros' THEN 'Otros'
    WHEN voto_general = 'Izquierda Española' THEN 'Izquierda Española'
    WHEN voto_general = 'P-Lib' THEN 'P-Lib'
    WHEN voto_general = 'Coalición Canaria' THEN 'Coalición Canaria'
    WHEN voto_general = 'JUNTS' THEN 'JUNTS'
    WHEN voto_general = 'Frente Obrero' THEN 'Frente Obrero'
    ELSE voto_general
  END as partido,
  ROUND(AVG(COALESCE(edad, 18))::numeric, 1) as edad_promedio,
  ROUND(AVG(COALESCE(posicion_ideologica, 5))::numeric, 1) as ideologia_promedio,
  COUNT(*) as total_votos
FROM public.respuestas
WHERE voto_general IS NOT NULL AND voto_general != ''
GROUP BY voto_general
ORDER BY total_votos DESC;

-- VIEW: Edad e ideología por asociación juvenil
CREATE OR REPLACE VIEW public.edad_ideologia_por_asociacion AS
SELECT 
  CASE 
    WHEN voto_juvenil = 'Jóvenes de VOX' THEN 'Jóvenes de VOX'
    WHEN voto_juvenil = 'Nuevas Generaciones del PP' THEN 'Nuevas Generaciones del PP'
    WHEN voto_juvenil = 'Voces Libres España (VLE)' THEN 'Voces Libres España (VLE)'
    WHEN voto_juvenil = 'Juventudes Socialistas de España' THEN 'Juventudes Socialistas de España'
    WHEN voto_juvenil = 'Juventudes Comunistas' THEN 'Juventudes Comunistas'
    WHEN voto_juvenil = 'Revuelta' THEN 'Revuelta'
    WHEN voto_juvenil = 'Jóvenes de Ciudadanos' THEN 'Jóvenes de Ciudadanos'
    WHEN voto_juvenil = 'S''ha Acabat!' THEN 'S''ha Acabat!'
    ELSE voto_juvenil
  END as asociacion,
  ROUND(AVG(COALESCE(edad, 18))::numeric, 1) as edad_promedio,
  ROUND(AVG(COALESCE(posicion_ideologica, 5))::numeric, 1) as ideologia_promedio,
  COUNT(*) as total_votos
FROM public.respuestas
WHERE voto_juvenil IS NOT NULL AND voto_juvenil != ''
GROUP BY voto_juvenil
ORDER BY total_votos DESC;

-- VIEW: Historial de votos por fecha
CREATE OR REPLACE VIEW public.historial_votos_por_fecha AS
SELECT 
  DATE(created_at) as fecha,
  voto_general as partido,
  COUNT(*) as votos_diarios
FROM public.respuestas
WHERE voto_general IS NOT NULL AND voto_general != ''
GROUP BY DATE(created_at), voto_general
ORDER BY fecha DESC, votos_diarios DESC;

-- VIEW: Distribución de edad
CREATE OR REPLACE VIEW public.distribucion_edad AS
SELECT 
  CASE 
    WHEN edad < 18 THEN 'Menor de 18'
    WHEN edad >= 18 AND edad < 25 THEN '18-24'
    WHEN edad >= 25 AND edad < 35 THEN '25-34'
    WHEN edad >= 35 AND edad < 45 THEN '35-44'
    WHEN edad >= 45 AND edad < 55 THEN '45-54'
    WHEN edad >= 55 AND edad < 65 THEN '55-64'
    WHEN edad >= 65 THEN '65+'
    ELSE 'Sin especificar'
  END as rango_edad,
  COUNT(*) as cantidad,
  ROUND((COUNT(*)::numeric / (SELECT COUNT(*) FROM public.respuestas)) * 100, 1) as porcentaje
FROM public.respuestas
GROUP BY rango_edad
ORDER BY 
  CASE 
    WHEN rango_edad = 'Menor de 18' THEN 1
    WHEN rango_edad = '18-24' THEN 2
    WHEN rango_edad = '25-34' THEN 3
    WHEN rango_edad = '35-44' THEN 4
    WHEN rango_edad = '45-54' THEN 5
    WHEN rango_edad = '55-64' THEN 6
    WHEN rango_edad = '65+' THEN 7
    ELSE 8
  END;
