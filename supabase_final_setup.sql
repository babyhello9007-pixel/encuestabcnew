-- ============================================================================
-- SCRIPT FINAL PARA SUPABASE - ENCUESTA DE BATALLA CULTURAL
-- ============================================================================

-- ============================================================================
-- 1. TABLA DE POLÍTICOS
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.politicos (
  id TEXT NOT NULL PRIMARY KEY,
  nombre TEXT NOT NULL,
  apellidos TEXT,
  partido TEXT,
  cargo TEXT,
  imagen_url TEXT,
  descripcion TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Insertar datos de políticos
INSERT INTO public.politicos (id, nombre, apellidos, partido, cargo, imagen_url) VALUES
('FEIJOO', 'Alberto', 'Núñez Feijóo', 'PP', 'Presidente del PP', '/assets/images/AlbertoNuñezFeijoo.png'),
('SANCHEZ', 'Pedro', 'Sánchez', 'PSOE', 'Presidente del Gobierno', '/assets/images/PedroSanchez.png'),
('ABASCAL', 'Santiago', 'Abascal', 'VOX', 'Presidente de VOX', '/assets/images/SantiagoAbascal.png'),
('ALVISE', 'Alvise', 'Pérez', 'Se Acabó La Fiesta', 'Fundador de Se Acabó La Fiesta', '/assets/images/AlvisePerez.png'),
('YOLANDA', 'Yolanda', 'Díaz', 'SUMAR', 'Ministra de Trabajo', '/assets/images/YolandaDiaz.png'),
('IRENE', 'Irene', 'Montero', 'PODEMOS', 'Diputada', '/assets/images/IreneMontero.png'),
('AYUSO', 'Isabel Díaz', 'Ayuso', 'PP', 'Presidenta de la Comunidad de Madrid', '/assets/images/IsabelDiazAyuso.png'),
('BUXADE', 'Jorge', 'Buxadé', 'VOX', 'Portavoz de VOX en el Congreso', '/assets/images/JorgeBuxade.png')
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- 2. TABLA DE COMENTARIOS
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

-- Crear índices para comentarios
CREATE INDEX IF NOT EXISTS idx_comentarios_tab ON public.comentarios_resultados(tab);
CREATE INDEX IF NOT EXISTS idx_comentarios_estado ON public.comentarios_resultados(estado);
CREATE INDEX IF NOT EXISTS idx_comentarios_created_at ON public.comentarios_resultados(created_at DESC);

-- Habilitar RLS para comentarios
ALTER TABLE public.comentarios_resultados ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para comentarios
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
-- 3. TABLA DE COMPARTIR RESULTADOS (para tracking)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.compartir_resultados (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tipo_compartir VARCHAR(50) CHECK (tipo_compartir IN ('png', 'x', 'facebook', 'pdf')),
  resultado_tipo VARCHAR(50) CHECK (resultado_tipo IN ('general', 'youth')),
  resultado_id TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Crear índices para tracking
CREATE INDEX IF NOT EXISTS idx_compartir_tipo ON public.compartir_resultados(tipo_compartir);
CREATE INDEX IF NOT EXISTS idx_compartir_created_at ON public.compartir_resultados(created_at);

-- ============================================================================
-- 4. VISTAS PARA ESTADÍSTICAS (si no existen)
-- ============================================================================

-- Vista de edad e ideología por partido (si no existe)
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
FROM respuestas
WHERE voto_generales IS NOT NULL AND voto_generales <> ''::text
GROUP BY voto_generales
ORDER BY COUNT(*) DESC;

-- Vista de edad e ideología por asociación (si no existe)
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
FROM respuestas
WHERE voto_asociacion_juvenil IS NOT NULL AND voto_asociacion_juvenil <> ''::text
GROUP BY voto_asociacion_juvenil
ORDER BY COUNT(*) DESC;

-- Vista de valoraciones de políticos
CREATE OR REPLACE VIEW public.valoraciones_politicos_promedio AS
SELECT
  politico,
  ROUND(AVG(valoracion)::numeric, 2) AS valoracion_promedio,
  COUNT(*) AS total_valoraciones
FROM respuestas
WHERE politico IS NOT NULL
GROUP BY politico
ORDER BY valoracion_promedio DESC;

-- ============================================================================
-- 5. PERMISOS Y POLÍTICAS DE SEGURIDAD
-- ============================================================================

-- Habilitar RLS en tablas
ALTER TABLE public.politicos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compartir_resultados ENABLE ROW LEVEL SECURITY;

-- Políticas de lectura pública
CREATE POLICY IF NOT EXISTS "Allow public read politicos" ON public.politicos FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "Allow public insert compartir" ON public.compartir_resultados FOR INSERT WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "Allow public read compartir" ON public.compartir_resultados FOR SELECT USING (true);

-- ============================================================================
-- FIN DEL SCRIPT
-- ============================================================================

