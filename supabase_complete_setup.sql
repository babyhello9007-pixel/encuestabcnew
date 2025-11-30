-- ============================================================================
-- SCRIPT COMPLETO DE SUPABASE PARA ENCUESTA DE BATALLA CULTURAL
-- ============================================================================

-- ============================================================================
-- 1. TABLA DE PARTIDOS GENERALES
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.partidos_generales (
  id TEXT NOT NULL PRIMARY KEY,
  nombre_completo TEXT NOT NULL,
  nombre_corto TEXT,
  escanos INTEGER DEFAULT 0,
  logo_url TEXT,
  descripcion TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Insertar datos de partidos generales
INSERT INTO public.partidos_generales (id, nombre_completo, nombre_corto, logo_url) VALUES
('PP', 'Partido Popular', 'PP', '/assets/icons/PP.png'),
('PSOE', 'Partido Socialista Obrero Español', 'PSOE', '/assets/icons/PSOE.png'),
('VOX', 'VOX', 'VOX', '/assets/icons/VOX.png'),
('SUMAR', 'SUMAR', 'SUMAR', '/assets/icons/SUMAR.png'),
('PODEMOS', 'PODEMOS', 'PODEMOS', '/assets/icons/PODEMOS.png'),
('JUNTS', 'Junts per Catalunya', 'JUNTS', '/assets/icons/JUNTS.png'),
('ERC', 'Esquerra Republicana de Catalunya', 'ERC', '/assets/icons/ERC.png'),
('PNV', 'Partido Nacionalista Vasco', 'PNV', '/assets/icons/PNV.png'),
('ALIANZA', 'Aliança Catalana', 'Aliança', '/assets/icons/alianza.png'),
('BILDU', 'EH Bildu', 'BILDU', '/assets/icons/BILDU.png'),
('SAF', 'Se Acabó La Fiesta', 'SAF', '/assets/icons/saf.png'),
('CC', 'Coalición Canaria', 'CC', '/assets/icons/cc.png'),
('UPN', 'Unión del Pueblo Navarro', 'UPN', '/assets/icons/UPN.png'),
('CIUDADANOS', 'Ciudadanos', 'Cs', '/assets/icons/ciudadanos.png'),
('CAMINANDO', 'Caminando Juntos', 'CJ', '/assets/icons/CaminandoJuntos.png'),
('FRENTE', 'Frente Obrero', 'FO', '/assets/icons/FrenteObrero.png'),
('IZQUIERDA', 'Izquierda Española', 'IE', '/assets/icons/IzquierdaEspanola.png'),
('JUNTOS_EXT', 'Juntos por Extremadura', 'JPE', '/assets/icons/juntosporextremadura.png'),
('PLIB', 'P-Lib', 'P-Lib', '/assets/icons/plib.jpg'),
('EB', 'Escaños en Blanco', 'EB', '/assets/icons/EscañosEnBlanco.png'),
('BNG', 'Bloque Nacionalista Galego', 'BNG', '/assets/icons/bng.png')
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- 2. TABLA DE ASOCIACIONES JUVENILES
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.asociaciones_juveniles (
  id TEXT NOT NULL PRIMARY KEY,
  nombre_completo TEXT NOT NULL,
  nombre_corto TEXT,
  escanos INTEGER DEFAULT 0,
  logo_url TEXT,
  descripcion TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Insertar datos de asociaciones juveniles
INSERT INTO public.asociaciones_juveniles (id, nombre_completo, nombre_corto, logo_url) VALUES
('SHAACABAT', 'S''ha Acabat!', 'SAA', '/assets/icons/SHaAcabat.jpg'),
('REVUELTA', 'Revuelta', 'Revuelta', '/assets/icons/Revuelta.jpg'),
('NNGG', 'Nuevas Generaciones del PP', 'NNGG', '/assets/icons/NuevasGeneracionesdelPP.png'),
('JVOX', 'Jóvenes de VOX', 'JVOX', '/assets/icons/JóvenesDeVOX.png'),
('VLE', 'Voces Libres España (VLE)', 'VLE', '/assets/icons/VocesLibresDeEspaña.jpg'),
('JSE', 'Juventudes Socialistas de España', 'JSE', '/assets/icons/JuventudesSocialistasdeEspaña.png'),
('PATRIOTA', 'Acción Patriota', 'AP', '/assets/icons/Patriota.png'),
('JIU', 'Juventudes de Izquierda Unida', 'JIU', '/assets/icons/JuventudesDeIzquierdaUnida.jpg'),
('JCOMUNISTA', 'Juventudes Comunistas', 'JC', '/assets/icons/juventudescomunistas.png'),
('JCS', 'Jóvenes de Ciudadanos', 'JCS', '/assets/icons/jóvenesdeciudadanos.jpg'),
('EGI', 'EGI', 'EGI', '/assets/icons/egi.jpg'),
('ERNAI', 'Ernai', 'Ernai', '/assets/icons/ernai.jpg'),
('JERC', 'Joventuts d''Esquerra Republicana de Catalunya', 'JERC', '/assets/icons/jerc.png'),
('JNC', 'Joventut Nacionalista de Catalunya', 'JNC', '/assets/icons/JoventutNacionalistadeCatalunya.png'),
('GALIZANOVA', 'Galiza Nova', 'GN', '/assets/icons/galizanova.png'),
('ARRAN', 'Arran', 'Arran', '/assets/icons/arran.png'),
('JNCANA', 'Jóvenes Nacionalistas de Canarias', 'JNCANA', '/assets/icons/jncana.jpg'),
('JPV', 'Joves del País Valencià – Compromiís', 'JPV', '/assets/icons/jpv.png'),
('ACL', 'Acción Castilla y León', 'ACL', '/assets/icons/AcciónCastillayLeón.png'),
('JEC', 'Juventud Estudiante Católica', 'JEC', '/assets/icons/JuventudEstudianteCatólica.jpg'),
('AGORA', 'ÁGORA Canarias', 'AGORA', '/assets/icons/agora.png'),
('GENOP', 'Generación Operativa', 'GENOP', '/assets/icons/GeneracionOperativa.webp')
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- 3. TABLA DE POLÍTICOS
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.politicos (
  id TEXT NOT NULL PRIMARY KEY,
  nombre TEXT NOT NULL,
  apellidos TEXT,
  partido_id TEXT,
  cargo TEXT,
  imagen_url TEXT,
  descripcion TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (partido_id) REFERENCES public.partidos_generales(id)
);

-- Insertar datos de políticos
INSERT INTO public.politicos (id, nombre, apellidos, partido_id, cargo, imagen_url) VALUES
('FEIJOO', 'Alberto', 'Núñez Feijóo', 'PP', 'Presidente del PP', '/assets/images/AlbertoNuñezFeijoo.png'),
('SANCHEZ', 'Pedro', 'Sánchez', 'PSOE', 'Presidente del Gobierno', '/assets/images/PedroSanchez.png'),
('ABASCAL', 'Santiago', 'Abascal', 'VOX', 'Presidente de VOX', '/assets/images/SantiagoAbascal.png'),
('ALVISE', 'Alvise', 'Pérez', 'SAF', 'Fundador de Se Acabó La Fiesta', '/assets/images/AlvisePerez.png'),
('YOLANDA', 'Yolanda', 'Díaz', 'SUMAR', 'Ministra de Trabajo', '/assets/images/YolandaDiaz.png'),
('IRENE', 'Irene', 'Montero', 'PODEMOS', 'Diputada', '/assets/images/IreneMontero.png'),
('AYUSO', 'Isabel Díaz', 'Ayuso', 'PP', 'Presidenta de la Comunidad de Madrid', '/assets/images/IsabelDiazAyuso.png'),
('BUXADE', 'Jorge', 'Buxadé', 'VOX', 'Portavoz de VOX en el Congreso', '/assets/images/JorgeBuxade.png')
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- 4. TABLA DE COMENTARIOS
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.comentarios_resultados (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre VARCHAR(255),
  texto TEXT NOT NULL,
  tab VARCHAR(50) NOT NULL CHECK (tab IN ('general', 'youth')),
  likes INTEGER DEFAULT 0,
  usuario_id UUID,
  estado VARCHAR(50) DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'aprobado', 'rechazado')),
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
  FOR SELECT USING (estado = 'aprobado' OR estado IS NULL);

DROP POLICY IF EXISTS "Allow public insert comments" ON public.comentarios_resultados;
CREATE POLICY "Allow public insert comments" ON public.comentarios_resultados
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update likes" ON public.comentarios_resultados;
CREATE POLICY "Allow public update likes" ON public.comentarios_resultados
  FOR UPDATE USING (true) WITH CHECK (true);

-- ============================================================================
-- 5. TABLA DE MÉTRICAS POR PARTIDO
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.metricas_partidos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  partido_id TEXT NOT NULL,
  tab VARCHAR(50) NOT NULL CHECK (tab IN ('general', 'youth')),
  edad_promedio DECIMAL(5, 2),
  ideologia_promedio DECIMAL(5, 2),
  total_votos INTEGER DEFAULT 0,
  total_respuestas INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (partido_id) REFERENCES public.partidos_generales(id)
);

-- Crear índices para métricas
CREATE INDEX IF NOT EXISTS idx_metricas_partido ON public.metricas_partidos(partido_id);
CREATE INDEX IF NOT EXISTS idx_metricas_tab ON public.metricas_partidos(tab);

-- ============================================================================
-- 6. TABLA DE MÉTRICAS POR ASOCIACIÓN
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.metricas_asociaciones (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  asociacion_id TEXT NOT NULL,
  edad_promedio DECIMAL(5, 2),
  ideologia_promedio DECIMAL(5, 2),
  total_votos INTEGER DEFAULT 0,
  total_respuestas INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (asociacion_id) REFERENCES public.asociaciones_juveniles(id)
);

-- Crear índices para métricas de asociaciones
CREATE INDEX IF NOT EXISTS idx_metricas_asoc ON public.metricas_asociaciones(asociacion_id);

-- ============================================================================
-- 7. TABLA DE VOTOS GENERALES
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.votos_generales (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  partido_id TEXT NOT NULL,
  edad_votante INTEGER,
  ideologia_votante INTEGER,
  provincia TEXT,
  ccaa TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (partido_id) REFERENCES public.partidos_generales(id)
);

-- Crear índices para votos
CREATE INDEX IF NOT EXISTS idx_votos_partido ON public.votos_generales(partido_id);
CREATE INDEX IF NOT EXISTS idx_votos_created_at ON public.votos_generales(created_at);

-- ============================================================================
-- 8. TABLA DE VOTOS ASOCIACIONES
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.votos_asociaciones (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  asociacion_id TEXT NOT NULL,
  edad_votante INTEGER,
  ideologia_votante INTEGER,
  provincia TEXT,
  ccaa TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (asociacion_id) REFERENCES public.asociaciones_juveniles(id)
);

-- Crear índices para votos de asociaciones
CREATE INDEX IF NOT EXISTS idx_votos_asoc ON public.votos_asociaciones(asociacion_id);
CREATE INDEX IF NOT EXISTS idx_votos_asoc_created_at ON public.votos_asociaciones(created_at);

-- ============================================================================
-- 9. TABLA DE VALORACIONES DE POLÍTICOS
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.valoraciones_politicos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  politico_id TEXT NOT NULL,
  valoracion INTEGER CHECK (valoracion >= 1 AND valoracion <= 10),
  edad_votante INTEGER,
  ideologia_votante INTEGER,
  provincia TEXT,
  ccaa TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (politico_id) REFERENCES public.politicos(id)
);

-- Crear índices para valoraciones
CREATE INDEX IF NOT EXISTS idx_valoraciones_politico ON public.valoraciones_politicos(politico_id);
CREATE INDEX IF NOT EXISTS idx_valoraciones_created_at ON public.valoraciones_politicos(created_at);

-- ============================================================================
-- 10. VISTAS PARA ESTADÍSTICAS
-- ============================================================================

-- Vista de totales de votos generales
CREATE OR REPLACE VIEW votos_generales_totales AS
SELECT 
  partido_id,
  COUNT(*) as votos,
  ROUND(AVG(edad_votante)::numeric, 2) as edad_promedio,
  ROUND(AVG(ideologia_votante)::numeric, 2) as ideologia_promedio
FROM public.votos_generales
GROUP BY partido_id;

-- Vista de totales de votos asociaciones
CREATE OR REPLACE VIEW votos_asociaciones_totales AS
SELECT 
  asociacion_id,
  COUNT(*) as votos,
  ROUND(AVG(edad_votante)::numeric, 2) as edad_promedio,
  ROUND(AVG(ideologia_votante)::numeric, 2) as ideologia_promedio
FROM public.votos_asociaciones
GROUP BY asociacion_id;

-- Vista de valoraciones de políticos
CREATE OR REPLACE VIEW valoraciones_politicos_totales AS
SELECT 
  politico_id,
  COUNT(*) as total_valoraciones,
  ROUND(AVG(valoracion)::numeric, 2) as valoracion_promedio,
  ROUND(AVG(edad_votante)::numeric, 2) as edad_promedio,
  ROUND(AVG(ideologia_votante)::numeric, 2) as ideologia_promedio
FROM public.valoraciones_politicos
GROUP BY politico_id;

-- ============================================================================
-- 11. PERMISOS Y POLÍTICAS DE SEGURIDAD
-- ============================================================================

-- Habilitar RLS en todas las tablas
ALTER TABLE public.partidos_generales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asociaciones_juveniles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.politicos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.votos_generales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.votos_asociaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.valoraciones_politicos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.metricas_partidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.metricas_asociaciones ENABLE ROW LEVEL SECURITY;

-- Políticas de lectura pública
CREATE POLICY "Allow public read partidos" ON public.partidos_generales FOR SELECT USING (true);
CREATE POLICY "Allow public read asociaciones" ON public.asociaciones_juveniles FOR SELECT USING (true);
CREATE POLICY "Allow public read politicos" ON public.politicos FOR SELECT USING (true);
CREATE POLICY "Allow public read votos generales" ON public.votos_generales FOR SELECT USING (true);
CREATE POLICY "Allow public read votos asociaciones" ON public.votos_asociaciones FOR SELECT USING (true);
CREATE POLICY "Allow public read valoraciones" ON public.valoraciones_politicos FOR SELECT USING (true);
CREATE POLICY "Allow public read metricas partidos" ON public.metricas_partidos FOR SELECT USING (true);
CREATE POLICY "Allow public read metricas asociaciones" ON public.metricas_asociaciones FOR SELECT USING (true);

-- Políticas de inserción pública (para votos y valoraciones)
CREATE POLICY "Allow public insert votos generales" ON public.votos_generales FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public insert votos asociaciones" ON public.votos_asociaciones FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public insert valoraciones" ON public.valoraciones_politicos FOR INSERT WITH CHECK (true);

-- ============================================================================
-- FIN DEL SCRIPT
-- ============================================================================

