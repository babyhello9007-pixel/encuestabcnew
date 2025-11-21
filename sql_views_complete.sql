-- ============================================
-- VISTAS PARA LA ENCUESTA DE BATALLA CULTURAL
-- ============================================

-- 1. Vista: Total de respuestas
CREATE OR REPLACE VIEW total_respuestas_view AS
SELECT COUNT(*) as total_respuestas
FROM respuestas;

-- 2. Vista: Votos generales totales (por partido)
CREATE OR REPLACE VIEW votos_generales_totales AS
SELECT 
  partido_id,
  COUNT(*) as votos
FROM respuestas
WHERE partido_id IS NOT NULL
GROUP BY partido_id
ORDER BY votos DESC;

-- 3. Vista: Votos juveniles totales (por asociación)
CREATE OR REPLACE VIEW votos_juveniles_totales AS
SELECT 
  asociacion_id,
  COUNT(*) as votos
FROM respuestas
WHERE asociacion_id IS NOT NULL
GROUP BY asociacion_id
ORDER BY votos DESC;

-- 4. Vista: Edad promedio general
CREATE OR REPLACE VIEW edad_promedio AS
SELECT AVG(CAST(edad AS FLOAT)) as edad_promedio
FROM respuestas
WHERE edad IS NOT NULL AND edad != '';

-- 5. Vista: Ideología promedio general
CREATE OR REPLACE VIEW ideologia_promedio AS
SELECT AVG(CAST(posicion_ideologica AS FLOAT)) as ideologia_promedio
FROM respuestas
WHERE posicion_ideologica IS NOT NULL AND posicion_ideologica != '';

-- 6. Vista: Edad e ideología promedio por partido
CREATE OR REPLACE VIEW edad_ideologia_por_partido AS
SELECT 
  partido_id,
  AVG(CAST(edad AS FLOAT)) as edad_promedio,
  AVG(CAST(posicion_ideologica AS FLOAT)) as ideologia_promedio,
  COUNT(*) as total_votos
FROM respuestas
WHERE partido_id IS NOT NULL 
  AND edad IS NOT NULL AND edad != ''
  AND posicion_ideologica IS NOT NULL AND posicion_ideologica != ''
GROUP BY partido_id
ORDER BY total_votos DESC;

-- 7. Vista: Edad e ideología promedio por asociación juvenil
CREATE OR REPLACE VIEW edad_ideologia_por_asociacion AS
SELECT 
  asociacion_id,
  AVG(CAST(edad AS FLOAT)) as edad_promedio,
  AVG(CAST(posicion_ideologica AS FLOAT)) as ideologia_promedio,
  COUNT(*) as total_votos
FROM respuestas
WHERE asociacion_id IS NOT NULL 
  AND edad IS NOT NULL AND edad != ''
  AND posicion_ideologica IS NOT NULL AND posicion_ideologica != ''
GROUP BY asociacion_id
ORDER BY total_votos DESC;

-- 8. Vista: Historial de votos por fecha
CREATE OR REPLACE VIEW historial_votos_por_fecha AS
SELECT 
  DATE(created_at) as fecha,
  COUNT(*) as votos
FROM respuestas
WHERE created_at IS NOT NULL
GROUP BY DATE(created_at)
ORDER BY fecha ASC;

-- 9. Vista: Distribución por edad
CREATE OR REPLACE VIEW distribucion_edad AS
SELECT 
  CASE 
    WHEN CAST(edad AS INTEGER) < 18 THEN '< 18'
    WHEN CAST(edad AS INTEGER) < 25 THEN '18-24'
    WHEN CAST(edad AS INTEGER) < 35 THEN '25-34'
    WHEN CAST(edad AS INTEGER) < 45 THEN '35-44'
    WHEN CAST(edad AS INTEGER) < 55 THEN '45-54'
    WHEN CAST(edad AS INTEGER) < 65 THEN '55-64'
    ELSE '65+'
  END as rango_edad,
  COUNT(*) as cantidad
FROM respuestas
WHERE edad IS NOT NULL AND edad != ''
GROUP BY rango_edad
ORDER BY rango_edad;

-- 10. Vista: Valoraciones de líderes
CREATE OR REPLACE VIEW valoraciones_lideres_view AS
SELECT 
  'feijoo' as lider,
  AVG(CAST(val_feijoo AS FLOAT)) as promedio_valoracion,
  COUNT(CASE WHEN val_feijoo IS NOT NULL THEN 1 END) as total_valoraciones
FROM respuestas
UNION ALL
SELECT 
  'sanchez' as lider,
  AVG(CAST(val_sanchez AS FLOAT)) as promedio_valoracion,
  COUNT(CASE WHEN val_sanchez IS NOT NULL THEN 1 END) as total_valoraciones
FROM respuestas
UNION ALL
SELECT 
  'abascal' as lider,
  AVG(CAST(val_abascal AS FLOAT)) as promedio_valoracion,
  COUNT(CASE WHEN val_abascal IS NOT NULL THEN 1 END) as total_valoraciones
FROM respuestas
UNION ALL
SELECT 
  'alvise' as lider,
  AVG(CAST(val_alvise AS FLOAT)) as promedio_valoracion,
  COUNT(CASE WHEN val_alvise IS NOT NULL THEN 1 END) as total_valoraciones
FROM respuestas
UNION ALL
SELECT 
  'yolanda_diaz' as lider,
  AVG(CAST(val_yolanda_diaz AS FLOAT)) as promedio_valoracion,
  COUNT(CASE WHEN val_yolanda_diaz IS NOT NULL THEN 1 END) as total_valoraciones
FROM respuestas
UNION ALL
SELECT 
  'irene_montero' as lider,
  AVG(CAST(val_irene_montero AS FLOAT)) as promedio_valoracion,
  COUNT(CASE WHEN val_irene_montero IS NOT NULL THEN 1 END) as total_valoraciones
FROM respuestas
UNION ALL
SELECT 
  'ayuso' as lider,
  AVG(CAST(val_ayuso AS FLOAT)) as promedio_valoracion,
  COUNT(CASE WHEN val_ayuso IS NOT NULL THEN 1 END) as total_valoraciones
FROM respuestas
UNION ALL
SELECT 
  'buxade' as lider,
  AVG(CAST(val_buxade AS FLOAT)) as promedio_valoracion,
  COUNT(CASE WHEN val_buxade IS NOT NULL THEN 1 END) as total_valoraciones
FROM respuestas;

