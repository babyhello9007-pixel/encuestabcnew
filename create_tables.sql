-- Crear tabla de partidos generales
CREATE TABLE IF NOT EXISTS public.partidos_generales (
  id TEXT NOT NULL PRIMARY KEY,
  nombre_completo TEXT NOT NULL,
  escanos INTEGER DEFAULT 0,
  logo_path TEXT
);

-- Crear tabla de asociaciones juveniles
CREATE TABLE IF NOT EXISTS public.asociaciones_juveniles (
  id TEXT NOT NULL PRIMARY KEY,
  nombre_completo TEXT NOT NULL,
  escanos INTEGER DEFAULT 0,
  logo_path TEXT
);

-- Insertar datos de partidos generales
INSERT INTO public.partidos_generales (id, nombre_completo, escanos, logo_path) VALUES
('PP', 'Partido Popular', 0, '/assets/icons/PP.png'),
('PSOE', 'Partido Socialista Obrero Español', 0, '/assets/icons/PSOE.png'),
('VOX', 'VOX', 0, '/assets/icons/VOX.png'),
('SUMAR', 'SUMAR', 0, '/assets/icons/SUMAR.png'),
('PODEMOS', 'PODEMOS', 0, '/assets/icons/PODEMOS.png'),
('JUNTS', 'Junts per Catalunya', 0, '/assets/icons/JUNTS.png'),
('ERC', 'Esquerra Republicana de Catalunya', 0, '/assets/icons/ERC.png'),
('PNV', 'Partido Nacionalista Vasco', 0, '/assets/icons/PNV.png'),
('ALIANZA', 'Aliança Catalana', 0, '/assets/icons/alianza.png'),
('BILDU', 'EH Bildu', 0, '/assets/icons/BILDU.png'),
('SAF', 'Se Acabó La Fiesta', 0, '/assets/icons/saf.png'),
('CC', 'Coalición Canaria', 0, '/assets/icons/cc.png'),
('UPN', 'Unión del Pueblo Navarro', 0, '/assets/icons/UPN.png'),
('CIUDADANOS', 'Ciudadanos', 0, '/assets/icons/ciudadanos.png'),
('CAMINANDO', 'Caminando Juntos', 0, '/assets/icons/CaminandoJuntos.png'),
('FRENTE', 'Frente Obrero', 0, '/assets/icons/FrenteObrero.png'),
('IZQUIERDA', 'Izquierda Española', 0, '/assets/icons/IzquierdaEspanola.png'),
('JUNTOS_EXT', 'Juntos por Extremadura', 0, '/assets/icons/juntosporextremadura.png'),
('PLIB', 'P-Lib', 0, '/assets/icons/plib.jpg'),
('EB', 'Escaños en Blanco', 0, '/assets/icons/EscañosEnBlanco.png'),
('BNG', 'Bloque Nacionalista Galego', 0, '/assets/icons/bng.png'),
('OTROS', 'Otros', 0, '/assets/icons/otro.png')
ON CONFLICT (id) DO NOTHING;

-- Insertar datos de asociaciones juveniles
INSERT INTO public.asociaciones_juveniles (id, nombre_completo, escanos, logo_path) VALUES
('SHAACABAT', 'S''ha Acabat!', 0, '/assets/icons/SHaAcabat.jpg'),
('REVUELTA', 'Revuelta', 0, '/assets/icons/Revuelta.jpg'),
('NNGG', 'Nuevas Generaciones del PP', 0, '/assets/icons/NuevasGeneracionesdelPP.png'),
('JVOX', 'Jóvenes de VOX', 0, '/assets/icons/JóvenesDeVOX.png'),
('VLE', 'Voces Libres España (VLE)', 0, '/assets/icons/VocesLibresDeEspaña.jpg'),
('JSE', 'Juventudes Socialistas de España', 0, '/assets/icons/JuventudesSocialistasdeEspaña.png'),
('PATRIOTA', 'Acción Patriota', 0, '/assets/icons/Patriota.png'),
('JIU', 'Juventudes de Izquierda Unida', 0, '/assets/icons/JuventudesDeIzquierdaUnida.jpg'),
('JCOMUNISTA', 'Juventudes Comunistas', 0, '/assets/icons/juventudescomunistas.png'),
('JCS', 'Jóvenes de Ciudadanos', 0, '/assets/icons/jóvenesdeciudadanos.jpg'),
('EGI', 'EGI', 0, '/assets/icons/egi.jpg'),
('ERNAI', 'Ernai', 0, '/assets/icons/ernai.jpg'),
('JERC', 'Joventuts d''Esquerra Republicana de Catalunya', 0, '/assets/icons/jerc.png'),
('JNC', 'Joventut Nacionalista de Catalunya', 0, '/assets/icons/JoventutNacionalistadeCatalunya.png'),
('GALIZANOVA', 'Galiza Nova', 0, '/assets/icons/galizanova.png'),
('ARRAN', 'Arran', 0, '/assets/icons/arran.png'),
('JNCANA', 'Jóvenes Nacionalistas de Canarias', 0, '/assets/icons/jncana.jpg'),
('JPV', 'Joves del País Valencià – Compromiís', 0, '/assets/icons/jpv.png'),
('ACL', 'Acción Castilla y León', 0, '/assets/icons/AcciónCastillayLeón.png'),
('JEC', 'Juventud Estudiante Católica', 0, '/assets/icons/JuventudEstudianteCatólica.jpg'),
('AGORA', 'ÁGORA Canarias', 0, '/assets/icons/agora.png'),
('GENOP', 'Generación Operativa', 0, '/assets/icons/GeneracionOperativa.webp'),
('OTROS', 'Otros', 0, '/assets/icons/otro.png')
ON CONFLICT (id) DO NOTHING;

-- Crear índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_partidos_id ON public.partidos_generales(id);
CREATE INDEX IF NOT EXISTS idx_asociaciones_id ON public.asociaciones_juveniles(id);

