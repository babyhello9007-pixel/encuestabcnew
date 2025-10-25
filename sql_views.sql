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
