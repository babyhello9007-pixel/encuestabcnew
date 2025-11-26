-- ============================================================================
-- SCRIPT DE VISTAS COMPLETAS PARA SUPABASE
-- ============================================================================

-- ============================================================================
-- 1. VISTA: Media de Nota Ejecutivo
-- ============================================================================
CREATE OR REPLACE VIEW public.media_nota_ejecutivo AS
SELECT
  ROUND(AVG(COALESCE(nota_ejecutivo, 5))::numeric, 2) AS nota_media,
  COUNT(CASE WHEN nota_ejecutivo IS NOT NULL THEN 1 END) AS total_respuestas
FROM public.respuestas;

-- ============================================================================
-- 2. VISTA: Edad e Ideología por Partido
-- ============================================================================
CREATE OR REPLACE VIEW public.edad_ideologia_por_partido AS
SELECT
  CASE
    WHEN voto_generales = 'PP'::text THEN 'PP'::text
    WHEN voto_generales = 'PSOE'::text THEN 'PSOE'::text
    WHEN voto_generales = 'VOX'::text THEN 'VOX'::text
    WHEN voto_generales = 'Podemos'::text THEN 'PODEMOS'::text
    WHEN voto_generales = 'Ciudadanos'::text THEN 'Ciudadanos'::text
    WHEN voto_generales = 'Se Acabó La Fiesta'::text THEN 'Se Acabó La Fiesta'::text
    WHEN voto_generales = 'SUMAR'::text THEN 'SUMAR'::text
    WHEN voto_generales = 'Aliança Catalana'::text THEN 'Aliança Catalana'::text
    WHEN voto_generales = 'Escaños en Blanco'::text THEN 'Escaños en Blanco'::text
    WHEN voto_generales = 'Otros'::text THEN 'Otros'::text
    WHEN voto_generales = 'Izquierda Española'::text THEN 'Izquierda Española'::text
    WHEN voto_generales = 'P-Lib'::text THEN 'P-Lib'::text
    WHEN voto_generales = 'Coalición Canaria'::text THEN 'Coalición Canaria'::text
    WHEN voto_generales = 'JUNTS'::text THEN 'JUNTS'::text
    WHEN voto_generales = 'Frente Obrero'::text THEN 'Frente Obrero'::text
    ELSE voto_generales
  END AS partido,
  ROUND(AVG(COALESCE(edad, 18))::numeric, 1) AS edad_promedio,
  ROUND(AVG(COALESCE(posicion_ideologica, 5))::numeric, 1) AS ideologia_promedio,
  COUNT(*) AS total_votos
FROM public.respuestas
WHERE voto_generales IS NOT NULL AND voto_generales <> ''::text
GROUP BY voto_generales
ORDER BY COUNT(*) DESC;

-- ============================================================================
-- 3. VISTA: Edad e Ideología por Asociación
-- ============================================================================
CREATE OR REPLACE VIEW public.edad_ideologia_por_asociacion AS
SELECT
  CASE
    WHEN voto_asociacion_juvenil = 'Jóvenes de VOX'::text THEN 'Jóvenes de VOX'::text
    WHEN voto_asociacion_juvenil = 'Nuevas Generaciones del PP'::text THEN 'Nuevas Generaciones del PP'::text
    WHEN voto_asociacion_juvenil = 'Voces Libres España (VLE)'::text THEN 'Voces Libres España (VLE)'::text
    WHEN voto_asociacion_juvenil = 'Juventudes Socialistas de España'::text THEN 'Juventudes Socialistas de España'::text
    WHEN voto_asociacion_juvenil = 'Juventudes Comunistas'::text THEN 'Juventudes Comunistas'::text
    WHEN voto_asociacion_juvenil = 'Revuelta'::text THEN 'Revuelta'::text
    WHEN voto_asociacion_juvenil = 'Jóvenes de Ciudadanos'::text THEN 'Jóvenes de Ciudadanos'::text
    WHEN voto_asociacion_juvenil = 'S''ha Acabat!'::text THEN 'S''ha Acabat!'::text
    ELSE voto_asociacion_juvenil
  END AS asociacion,
  ROUND(AVG(COALESCE(edad, 18))::numeric, 1) AS edad_promedio,
  ROUND(AVG(COALESCE(posicion_ideologica, 5))::numeric, 1) AS ideologia_promedio,
  COUNT(*) AS total_votos
FROM public.respuestas
WHERE voto_asociacion_juvenil IS NOT NULL AND voto_asociacion_juvenil <> ''::text
GROUP BY voto_asociacion_juvenil
ORDER BY COUNT(*) DESC;

-- ============================================================================
-- 4. VISTA: Valoraciones de Líderes
-- ============================================================================
CREATE OR REPLACE VIEW public.valoraciones_lideres_view AS
SELECT
  'feijoo'::text AS lider,
  'Alberto Núñez Feijóo'::text AS nombre_completo,
  ROUND(AVG(respuestas.val_feijoo::numeric), 1) AS valoracion_media,
  COUNT(CASE WHEN respuestas.val_feijoo IS NOT NULL THEN 1 ELSE NULL::integer END) AS total_valoraciones
FROM respuestas
UNION ALL
SELECT
  'sanchez'::text AS lider,
  'Pedro Sánchez'::text AS nombre_completo,
  ROUND(AVG(respuestas.val_sanchez::numeric), 1) AS valoracion_media,
  COUNT(CASE WHEN respuestas.val_sanchez IS NOT NULL THEN 1 ELSE NULL::integer END) AS total_valoraciones
FROM respuestas
UNION ALL
SELECT
  'abascal'::text AS lider,
  'Santiago Abascal'::text AS nombre_completo,
  ROUND(AVG(respuestas.val_abascal::numeric), 1) AS valoracion_media,
  COUNT(CASE WHEN respuestas.val_abascal IS NOT NULL THEN 1 ELSE NULL::integer END) AS total_valoraciones
FROM respuestas
UNION ALL
SELECT
  'alvise'::text AS lider,
  'Alvise Pérez'::text AS nombre_completo,
  ROUND(AVG(respuestas.val_alvise::numeric), 1) AS valoracion_media,
  COUNT(CASE WHEN respuestas.val_alvise IS NOT NULL THEN 1 ELSE NULL::integer END) AS total_valoraciones
FROM respuestas
UNION ALL
SELECT
  'yolanda_diaz'::text AS lider,
  'Yolanda Díaz'::text AS nombre_completo,
  ROUND(AVG(respuestas.val_yolanda_diaz::numeric), 1) AS valoracion_media,
  COUNT(CASE WHEN respuestas.val_yolanda_diaz IS NOT NULL THEN 1 ELSE NULL::integer END) AS total_valoraciones
FROM respuestas
UNION ALL
SELECT
  'irene_montero'::text AS lider,
  'Irene Montero'::text AS nombre_completo,
  ROUND(AVG(respuestas.val_irene_montero::numeric), 1) AS valoracion_media,
  COUNT(CASE WHEN respuestas.val_irene_montero IS NOT NULL THEN 1 ELSE NULL::integer END) AS total_valoraciones
FROM respuestas
UNION ALL
SELECT
  'ayuso'::text AS lider,
  'Isabel Díaz Ayuso'::text AS nombre_completo,
  ROUND(AVG(respuestas.val_ayuso::numeric), 1) AS valoracion_media,
  COUNT(CASE WHEN respuestas.val_ayuso IS NOT NULL THEN 1 ELSE NULL::integer END) AS total_valoraciones
FROM respuestas
UNION ALL
SELECT
  'buxade'::text AS lider,
  'Jorge Buxadé'::text AS nombre_completo,
  ROUND(AVG(respuestas.val_buxade::numeric), 1) AS valoracion_media,
  COUNT(CASE WHEN respuestas.val_buxade IS NOT NULL THEN 1 ELSE NULL::integer END) AS total_valoraciones
FROM respuestas;

-- ============================================================================
-- 5. TABLA: Líderes Preferidos por Partido
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.lideres_preferidos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  respuesta_id UUID,
  partido TEXT NOT NULL,
  lider_preferido TEXT NOT NULL,
  es_personalizado BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Crear índices
CREATE INDEX IF NOT EXISTS idx_lideres_partido ON public.lideres_preferidos(partido);
CREATE INDEX IF NOT EXISTS idx_lideres_respuesta ON public.lideres_preferidos(respuesta_id);

-- ============================================================================
-- 6. VISTA: Ranking de Líderes por Partido
-- ============================================================================
CREATE OR REPLACE VIEW public.ranking_lideres_por_partido AS
SELECT
  partido,
  lider_preferido,
  COUNT(*) AS total_votos,
  ROUND((COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (PARTITION BY partido))::numeric, 2) AS porcentaje
FROM public.lideres_preferidos
GROUP BY partido, lider_preferido
ORDER BY partido, total_votos DESC;

-- ============================================================================
-- 7. TABLA: Comentarios Resultados (si no existe)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.comentarios_resultados (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre VARCHAR(255),
  texto TEXT NOT NULL,
  tab VARCHAR(50) NOT NULL CHECK (tab IN ('general', 'youth')),
  likes INTEGER DEFAULT 0,
  estado VARCHAR(50) DEFAULT 'aprobado' CHECK (estado IN ('pendiente', 'aprobado', 'rechazado')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Crear índices
CREATE INDEX IF NOT EXISTS idx_comentarios_tab ON public.comentarios_resultados(tab);
CREATE INDEX IF NOT EXISTS idx_comentarios_estado ON public.comentarios_resultados(estado);
CREATE INDEX IF NOT EXISTS idx_comentarios_created_at ON public.comentarios_resultados(created_at DESC);

-- ============================================================================
-- 8. PERMISOS Y POLÍTICAS DE SEGURIDAD
-- ============================================================================

-- Habilitar RLS
ALTER TABLE public.lideres_preferidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comentarios_resultados ENABLE ROW LEVEL SECURITY;

-- Políticas para líderes preferidos
DROP POLICY IF EXISTS "Allow public read lideres" ON public.lideres_preferidos;
CREATE POLICY "Allow public read lideres" ON public.lideres_preferidos FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public insert lideres" ON public.lideres_preferidos;
CREATE POLICY "Allow public insert lideres" ON public.lideres_preferidos FOR INSERT WITH CHECK (true);

-- Políticas para comentarios
DROP POLICY IF EXISTS "Allow public read comments" ON public.comentarios_resultados;
CREATE POLICY "Allow public read comments" ON public.comentarios_resultados
  FOR SELECT USING (estado = 'aprobado');

DROP POLICY IF EXISTS "Allow public insert comments" ON public.comentarios_resultados;
CREATE POLICY "Allow public insert comments" ON public.comentarios_resultados
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update likes" ON public.comentarios_resultados;
CREATE POLICY "Allow public update likes" ON public.comentarios_resultados
  FOR UPDATE USING (true) WITH CHECK (true);

-- ============================================================================
-- 9. PERMISOS DE LECTURA PÚBLICA PARA VISTAS
-- ============================================================================
GRANT SELECT ON public.media_nota_ejecutivo TO anon, authenticated;
GRANT SELECT ON public.edad_ideologia_por_partido TO anon, authenticated;
GRANT SELECT ON public.edad_ideologia_por_asociacion TO anon, authenticated;
GRANT SELECT ON public.valoraciones_lideres_view TO anon, authenticated;
GRANT SELECT ON public.ranking_lideres_por_partido TO anon, authenticated;

-- ============================================================================
-- FIN DEL SCRIPT
-- ============================================================================

