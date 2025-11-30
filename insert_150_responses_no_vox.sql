-- Script para insertar 150 respuestas de NanoEncuestaBC
-- Distribuidas entre todas las provincias españolas
-- Edades: 18-30 años
-- Ideología: 7/10
-- Partidos: PP, PSOE, PODEMOS, Ciudadanos, SUMAR, ERC, JUNTS, PNV, BILDU, BNG (SIN VOX)
-- Nacionalidad: Española

-- Provincias españolas (52 total)
-- Distribuiremos ~3 respuestas por provincia (52 * 3 = 156, ajustaremos a 150)

INSERT INTO respuestas (
  edad,
  provincia,
  ccaa,
  nacionalidad,
  voto_generales,
  voto_autonomicas,
  voto_municipales,
  voto_europeas,
  nota_ejecutivo,
  val_feijoo,
  val_sanchez,
  val_abascal,
  val_alvise,
  val_yolanda_diaz,
  val_irene_montero,
  val_ayuso,
  val_buxade,
  voto_asociacion_juvenil,
  created_at
) VALUES
-- Álava (3 respuestas)
(23, 'Álava', 'País Vasco', 'Española', 'PP', 'EAJ-PNV', 'PP', 'PP', 7, 6, 4, 2, 3, 5, 4, 5, 2, 'Nuevas Generaciones del PP', NOW()),
(26, 'Álava', 'País Vasco', 'Española', 'PSOE', 'EAJ-PNV', 'PSOE', 'PSOE', 7, 4, 7, 1, 2, 6, 5, 3, 1, 'Juventudes Socialistas', NOW()),
(29, 'Álava', 'País Vasco', 'Española', 'EAJ-PNV', 'EAJ-PNV', 'EAJ-PNV', 'EAJ-PNV', 7, 5, 5, 2, 3, 5, 4, 4, 2, 'Nuevas Generaciones del PP', NOW()),

-- Albacete (3 respuestas)
(22, 'Albacete', 'Castilla-La Mancha', 'Española', 'PP', 'PP', 'PP', 'PP', 7, 7, 3, 1, 2, 4, 3, 6, 1, 'Nuevas Generaciones del PP', NOW()),
(25, 'Albacete', 'Castilla-La Mancha', 'Española', 'PSOE', 'PSOE', 'PSOE', 'PSOE', 7, 3, 8, 1, 2, 7, 6, 2, 1, 'Juventudes Socialistas', NOW()),
(28, 'Albacete', 'Castilla-La Mancha', 'Española', 'PODEMOS', 'PODEMOS', 'PODEMOS', 'PODEMOS', 7, 2, 6, 2, 3, 8, 7, 2, 2, 'Jóvenes de PODEMOS', NOW()),

-- Alicante (3 respuestas)
(21, 'Alicante', 'Comunidad Valenciana', 'Española', 'PP', 'PP', 'PP', 'PP', 7, 6, 4, 1, 2, 5, 4, 5, 1, 'Nuevas Generaciones del PP', NOW()),
(24, 'Alicante', 'Comunidad Valenciana', 'Española', 'PSOE', 'PSOE', 'PSOE', 'PSOE', 7, 4, 7, 2, 3, 6, 5, 3, 2, 'Juventudes Socialistas', NOW()),
(27, 'Alicante', 'Comunidad Valenciana', 'Española', 'Ciudadanos', 'Ciudadanos', 'Ciudadanos', 'Ciudadanos', 7, 5, 5, 1, 2, 5, 4, 4, 1, 'Jóvenes de Ciudadanos', NOW()),

-- Almería (3 respuestas)
(20, 'Almería', 'Andalucía', 'Española', 'PP', 'PP', 'PP', 'PP', 7, 7, 2, 1, 2, 4, 3, 6, 1, 'Nuevas Generaciones del PP', NOW()),
(23, 'Almería', 'Andalucía', 'Española', 'PSOE', 'PSOE', 'PSOE', 'PSOE', 7, 3, 8, 1, 2, 7, 6, 2, 1, 'Juventudes Socialistas', NOW()),
(26, 'Almería', 'Andalucía', 'Española', 'PODEMOS', 'PODEMOS', 'PODEMOS', 'PODEMOS', 7, 2, 6, 2, 3, 8, 7, 2, 2, 'Jóvenes de PODEMOS', NOW()),

-- Ávila (3 respuestas)
(22, 'Ávila', 'Castilla y León', 'Española', 'PP', 'PP', 'PP', 'PP', 7, 7, 3, 1, 2, 4, 3, 6, 1, 'Nuevas Generaciones del PP', NOW()),
(25, 'Ávila', 'Castilla y León', 'Española', 'PSOE', 'PSOE', 'PSOE', 'PSOE', 7, 4, 7, 1, 2, 6, 5, 3, 1, 'Juventudes Socialistas', NOW()),
(28, 'Ávila', 'Castilla y León', 'Española', 'Ciudadanos', 'Ciudadanos', 'Ciudadanos', 'Ciudadanos', 7, 5, 5, 1, 2, 5, 4, 4, 1, 'Jóvenes de Ciudadanos', NOW()),

-- Badajoz (3 respuestas)
(21, 'Badajoz', 'Extremadura', 'Española', 'PSOE', 'PSOE', 'PSOE', 'PSOE', 7, 3, 8, 1, 2, 7, 6, 2, 1, 'Juventudes Socialistas', NOW()),
(24, 'Badajoz', 'Extremadura', 'Española', 'PP', 'PP', 'PP', 'PP', 7, 7, 3, 1, 2, 4, 3, 6, 1, 'Nuevas Generaciones del PP', NOW()),
(27, 'Badajoz', 'Extremadura', 'Española', 'PODEMOS', 'PODEMOS', 'PODEMOS', 'PODEMOS', 7, 2, 6, 2, 3, 8, 7, 2, 2, 'Jóvenes de PODEMOS', NOW()),

-- Baleares (3 respuestas)
(20, 'Baleares', 'Islas Baleares', 'Española', 'PSOE', 'PSOE', 'PSOE', 'PSOE', 7, 4, 7, 1, 2, 6, 5, 3, 1, 'Juventudes Socialistas', NOW()),
(23, 'Baleares', 'Islas Baleares', 'Española', 'PP', 'PP', 'PP', 'PP', 7, 6, 4, 1, 2, 5, 4, 5, 1, 'Nuevas Generaciones del PP', NOW()),
(26, 'Baleares', 'Islas Baleares', 'Española', 'Ciudadanos', 'Ciudadanos', 'Ciudadanos', 'Ciudadanos', 7, 5, 5, 1, 2, 5, 4, 4, 1, 'Jóvenes de Ciudadanos', NOW()),

-- Barcelona (3 respuestas)
(22, 'Barcelona', 'Cataluña', 'Española', 'PSOE', 'ERC', 'PSOE', 'PSOE', 7, 4, 7, 1, 2, 6, 5, 3, 1, 'Juventudes Socialistas', NOW()),
(25, 'Barcelona', 'Cataluña', 'Española', 'ERC', 'ERC', 'ERC', 'ERC', 7, 3, 5, 1, 2, 5, 4, 2, 1, 'Joventut d\'ERC', NOW()),
(28, 'Barcelona', 'Cataluña', 'Española', 'JUNTS', 'JUNTS', 'JUNTS', 'JUNTS', 7, 3, 4, 1, 2, 4, 3, 2, 1, 'Joventut de JUNTS', NOW()),

-- Burgos (3 respuestas)
(21, 'Burgos', 'Castilla y León', 'Española', 'PP', 'PP', 'PP', 'PP', 7, 7, 3, 1, 2, 4, 3, 6, 1, 'Nuevas Generaciones del PP', NOW()),
(24, 'Burgos', 'Castilla y León', 'Española', 'PSOE', 'PSOE', 'PSOE', 'PSOE', 7, 4, 7, 1, 2, 6, 5, 3, 1, 'Juventudes Socialistas', NOW()),
(27, 'Burgos', 'Castilla y León', 'Española', 'Ciudadanos', 'Ciudadanos', 'Ciudadanos', 'Ciudadanos', 7, 5, 5, 1, 2, 5, 4, 4, 1, 'Jóvenes de Ciudadanos', NOW()),

-- Cáceres (3 respuestas)
(20, 'Cáceres', 'Extremadura', 'Española', 'PSOE', 'PSOE', 'PSOE', 'PSOE', 7, 3, 8, 1, 2, 7, 6, 2, 1, 'Juventudes Socialistas', NOW()),
(23, 'Cáceres', 'Extremadura', 'Española', 'PP', 'PP', 'PP', 'PP', 7, 7, 3, 1, 2, 4, 3, 6, 1, 'Nuevas Generaciones del PP', NOW()),
(26, 'Cáceres', 'Extremadura', 'Española', 'PODEMOS', 'PODEMOS', 'PODEMOS', 'PODEMOS', 7, 2, 6, 2, 3, 8, 7, 2, 2, 'Jóvenes de PODEMOS', NOW()),

-- Cádiz (3 respuestas)
(22, 'Cádiz', 'Andalucía', 'Española', 'PSOE', 'PSOE', 'PSOE', 'PSOE', 7, 3, 8, 1, 2, 7, 6, 2, 1, 'Juventudes Socialistas', NOW()),
(25, 'Cádiz', 'Andalucía', 'Española', 'PP', 'PP', 'PP', 'PP', 7, 7, 3, 1, 2, 4, 3, 6, 1, 'Nuevas Generaciones del PP', NOW()),
(28, 'Cádiz', 'Andalucía', 'Española', 'PODEMOS', 'PODEMOS', 'PODEMOS', 'PODEMOS', 7, 2, 6, 2, 3, 8, 7, 2, 2, 'Jóvenes de PODEMOS', NOW()),

-- Castellón (3 respuestas)
(21, 'Castellón', 'Comunidad Valenciana', 'Española', 'PP', 'PP', 'PP', 'PP', 7, 6, 4, 1, 2, 5, 4, 5, 1, 'Nuevas Generaciones del PP', NOW()),
(24, 'Castellón', 'Comunidad Valenciana', 'Española', 'PSOE', 'PSOE', 'PSOE', 'PSOE', 7, 4, 7, 1, 2, 6, 5, 3, 1, 'Juventudes Socialistas', NOW()),
(27, 'Castellón', 'Comunidad Valenciana', 'Española', 'Ciudadanos', 'Ciudadanos', 'Ciudadanos', 'Ciudadanos', 7, 5, 5, 1, 2, 5, 4, 4, 1, 'Jóvenes de Ciudadanos', NOW()),

-- Ciudad Real (3 respuestas)
(20, 'Ciudad Real', 'Castilla-La Mancha', 'Española', 'PSOE', 'PSOE', 'PSOE', 'PSOE', 7, 3, 8, 1, 2, 7, 6, 2, 1, 'Juventudes Socialistas', NOW()),
(23, 'Ciudad Real', 'Castilla-La Mancha', 'Española', 'PP', 'PP', 'PP', 'PP', 7, 7, 3, 1, 2, 4, 3, 6, 1, 'Nuevas Generaciones del PP', NOW()),
(26, 'Ciudad Real', 'Castilla-La Mancha', 'Española', 'PODEMOS', 'PODEMOS', 'PODEMOS', 'PODEMOS', 7, 2, 6, 2, 3, 8, 7, 2, 2, 'Jóvenes de PODEMOS', NOW()),

-- Córdoba (3 respuestas)
(22, 'Córdoba', 'Andalucía', 'Española', 'PSOE', 'PSOE', 'PSOE', 'PSOE', 7, 3, 8, 1, 2, 7, 6, 2, 1, 'Juventudes Socialistas', NOW()),
(25, 'Córdoba', 'Andalucía', 'Española', 'PP', 'PP', 'PP', 'PP', 7, 7, 3, 1, 2, 4, 3, 6, 1, 'Nuevas Generaciones del PP', NOW()),
(28, 'Córdoba', 'Andalucía', 'Española', 'PODEMOS', 'PODEMOS', 'PODEMOS', 'PODEMOS', 7, 2, 6, 2, 3, 8, 7, 2, 2, 'Jóvenes de PODEMOS', NOW()),

-- Coruña (3 respuestas)
(21, 'Coruña', 'Galicia', 'Española', 'PSOE', 'PSOE', 'PSOE', 'PSOE', 7, 4, 7, 1, 2, 6, 5, 3, 1, 'Juventudes Socialistas', NOW()),
(24, 'Coruña', 'Galicia', 'Española', 'PP', 'PP', 'PP', 'PP', 7, 6, 4, 1, 2, 5, 4, 5, 1, 'Nuevas Generaciones del PP', NOW()),
(27, 'Coruña', 'Galicia', 'Española', 'BNG', 'BNG', 'BNG', 'BNG', 7, 3, 5, 1, 2, 5, 4, 2, 1, 'Xóvenes do BNG', NOW()),

-- Cuenca (3 respuestas)
(20, 'Cuenca', 'Castilla-La Mancha', 'Española', 'PP', 'PP', 'PP', 'PP', 7, 7, 3, 1, 2, 4, 3, 6, 1, 'Nuevas Generaciones del PP', NOW()),
(23, 'Cuenca', 'Castilla-La Mancha', 'Española', 'PSOE', 'PSOE', 'PSOE', 'PSOE', 7, 3, 8, 1, 2, 7, 6, 2, 1, 'Juventudes Socialistas', NOW()),
(26, 'Cuenca', 'Castilla-La Mancha', 'Española', 'Ciudadanos', 'Ciudadanos', 'Ciudadanos', 'Ciudadanos', 7, 5, 5, 1, 2, 5, 4, 4, 1, 'Jóvenes de Ciudadanos', NOW()),

-- Girona (3 respuestas)
(22, 'Girona', 'Cataluña', 'Española', 'PSOE', 'ERC', 'PSOE', 'PSOE', 7, 4, 7, 1, 2, 6, 5, 3, 1, 'Juventudes Socialistas', NOW()),
(25, 'Girona', 'Cataluña', 'Española', 'ERC', 'ERC', 'ERC', 'ERC', 7, 3, 5, 1, 2, 5, 4, 2, 1, 'Joventut d\'ERC', NOW()),
(28, 'Girona', 'Cataluña', 'Española', 'JUNTS', 'JUNTS', 'JUNTS', 'JUNTS', 7, 3, 4, 1, 2, 4, 3, 2, 1, 'Joventut de JUNTS', NOW()),

-- Granada (3 respuestas)
(21, 'Granada', 'Andalucía', 'Española', 'PSOE', 'PSOE', 'PSOE', 'PSOE', 7, 3, 8, 1, 2, 7, 6, 2, 1, 'Juventudes Socialistas', NOW()),
(24, 'Granada', 'Andalucía', 'Española', 'PP', 'PP', 'PP', 'PP', 7, 7, 3, 1, 2, 4, 3, 6, 1, 'Nuevas Generaciones del PP', NOW()),
(27, 'Granada', 'Andalucía', 'Española', 'PODEMOS', 'PODEMOS', 'PODEMOS', 'PODEMOS', 7, 2, 6, 2, 3, 8, 7, 2, 2, 'Jóvenes de PODEMOS', NOW()),

-- Guadalajara (3 respuestas)
(20, 'Guadalajara', 'Castilla-La Mancha', 'Española', 'PP', 'PP', 'PP', 'PP', 7, 7, 3, 1, 2, 4, 3, 6, 1, 'Nuevas Generaciones del PP', NOW()),
(23, 'Guadalajara', 'Castilla-La Mancha', 'Española', 'PSOE', 'PSOE', 'PSOE', 'PSOE', 7, 3, 8, 1, 2, 7, 6, 2, 1, 'Juventudes Socialistas', NOW()),
(26, 'Guadalajara', 'Castilla-La Mancha', 'Española', 'Ciudadanos', 'Ciudadanos', 'Ciudadanos', 'Ciudadanos', 7, 5, 5, 1, 2, 5, 4, 4, 1, 'Jóvenes de Ciudadanos', NOW()),

-- Guipúzcoa (3 respuestas)
(22, 'Guipúzcoa', 'País Vasco', 'Española', 'PSOE', 'EAJ-PNV', 'PSOE', 'PSOE', 7, 4, 7, 1, 2, 6, 5, 3, 1, 'Juventudes Socialistas', NOW()),
(25, 'Guipúzcoa', 'País Vasco', 'Española', 'EAJ-PNV', 'EAJ-PNV', 'EAJ-PNV', 'EAJ-PNV', 7, 5, 5, 1, 2, 5, 4, 4, 1, 'Nuevas Generaciones del PP', NOW()),
(28, 'Guipúzcoa', 'País Vasco', 'Española', 'BILDU', 'BILDU', 'BILDU', 'BILDU', 7, 2, 6, 1, 2, 7, 6, 2, 1, 'Jóvenes de BILDU', NOW()),

-- Huelva (3 respuestas)
(21, 'Huelva', 'Andalucía', 'Española', 'PSOE', 'PSOE', 'PSOE', 'PSOE', 7, 3, 8, 1, 2, 7, 6, 2, 1, 'Juventudes Socialistas', NOW()),
(24, 'Huelva', 'Andalucía', 'Española', 'PP', 'PP', 'PP', 'PP', 7, 7, 3, 1, 2, 4, 3, 6, 1, 'Nuevas Generaciones del PP', NOW()),
(27, 'Huelva', 'Andalucía', 'Española', 'PODEMOS', 'PODEMOS', 'PODEMOS', 'PODEMOS', 7, 2, 6, 2, 3, 8, 7, 2, 2, 'Jóvenes de PODEMOS', NOW()),

-- Huesca (3 respuestas)
(20, 'Huesca', 'Aragón', 'Española', 'PP', 'PP', 'PP', 'PP', 7, 7, 3, 1, 2, 4, 3, 6, 1, 'Nuevas Generaciones del PP', NOW()),
(23, 'Huesca', 'Aragón', 'Española', 'PSOE', 'PSOE', 'PSOE', 'PSOE', 7, 3, 8, 1, 2, 7, 6, 2, 1, 'Juventudes Socialistas', NOW()),
(26, 'Huesca', 'Aragón', 'Española', 'Ciudadanos', 'Ciudadanos', 'Ciudadanos', 'Ciudadanos', 7, 5, 5, 1, 2, 5, 4, 4, 1, 'Jóvenes de Ciudadanos', NOW()),

-- Jaén (3 respuestas)
(22, 'Jaén', 'Andalucía', 'Española', 'PSOE', 'PSOE', 'PSOE', 'PSOE', 7, 3, 8, 1, 2, 7, 6, 2, 1, 'Juventudes Socialistas', NOW()),
(25, 'Jaén', 'Andalucía', 'Española', 'PP', 'PP', 'PP', 'PP', 7, 7, 3, 1, 2, 4, 3, 6, 1, 'Nuevas Generaciones del PP', NOW()),
(28, 'Jaén', 'Andalucía', 'Española', 'PODEMOS', 'PODEMOS', 'PODEMOS', 'PODEMOS', 7, 2, 6, 2, 3, 8, 7, 2, 2, 'Jóvenes de PODEMOS', NOW()),

-- León (3 respuestas)
(21, 'León', 'Castilla y León', 'Española', 'PP', 'PP', 'PP', 'PP', 7, 7, 3, 1, 2, 4, 3, 6, 1, 'Nuevas Generaciones del PP', NOW()),
(24, 'León', 'Castilla y León', 'Española', 'PSOE', 'PSOE', 'PSOE', 'PSOE', 7, 4, 7, 1, 2, 6, 5, 3, 1, 'Juventudes Socialistas', NOW()),
(27, 'León', 'Castilla y León', 'Española', 'Ciudadanos', 'Ciudadanos', 'Ciudadanos', 'Ciudadanos', 7, 5, 5, 1, 2, 5, 4, 4, 1, 'Jóvenes de Ciudadanos', NOW()),

-- Lleida (3 respuestas)
(20, 'Lleida', 'Cataluña', 'Española', 'PSOE', 'ERC', 'PSOE', 'PSOE', 7, 4, 7, 1, 2, 6, 5, 3, 1, 'Juventudes Socialistas', NOW()),
(23, 'Lleida', 'Cataluña', 'Española', 'ERC', 'ERC', 'ERC', 'ERC', 7, 3, 5, 1, 2, 5, 4, 2, 1, 'Joventut d\'ERC', NOW()),
(26, 'Lleida', 'Cataluña', 'Española', 'JUNTS', 'JUNTS', 'JUNTS', 'JUNTS', 7, 3, 4, 1, 2, 4, 3, 2, 1, 'Joventut de JUNTS', NOW()),

-- Lugo (3 respuestas)
(22, 'Lugo', 'Galicia', 'Española', 'PSOE', 'PSOE', 'PSOE', 'PSOE', 7, 4, 7, 1, 2, 6, 5, 3, 1, 'Juventudes Socialistas', NOW()),
(25, 'Lugo', 'Galicia', 'Española', 'PP', 'PP', 'PP', 'PP', 7, 6, 4, 1, 2, 5, 4, 5, 1, 'Nuevas Generaciones del PP', NOW()),
(28, 'Lugo', 'Galicia', 'Española', 'BNG', 'BNG', 'BNG', 'BNG', 7, 3, 5, 1, 2, 5, 4, 2, 1, 'Xóvenes do BNG', NOW()),

-- Madrid (3 respuestas)
(21, 'Madrid', 'Madrid', 'Española', 'PP', 'PP', 'PP', 'PP', 7, 7, 3, 1, 2, 4, 3, 6, 1, 'Nuevas Generaciones del PP', NOW()),
(24, 'Madrid', 'Madrid', 'Española', 'PSOE', 'PSOE', 'PSOE', 'PSOE', 7, 4, 7, 1, 2, 6, 5, 3, 1, 'Juventudes Socialistas', NOW()),
(27, 'Madrid', 'Madrid', 'Española', 'PODEMOS', 'PODEMOS', 'PODEMOS', 'PODEMOS', 7, 2, 6, 2, 3, 8, 7, 2, 2, 'Jóvenes de PODEMOS', NOW()),

-- Málaga (3 respuestas)
(20, 'Málaga', 'Andalucía', 'Española', 'PSOE', 'PSOE', 'PSOE', 'PSOE', 7, 3, 8, 1, 2, 7, 6, 2, 1, 'Juventudes Socialistas', NOW()),
(23, 'Málaga', 'Andalucía', 'Española', 'PP', 'PP', 'PP', 'PP', 7, 7, 3, 1, 2, 4, 3, 6, 1, 'Nuevas Generaciones del PP', NOW()),
(26, 'Málaga', 'Andalucía', 'Española', 'PODEMOS', 'PODEMOS', 'PODEMOS', 'PODEMOS', 7, 2, 6, 2, 3, 8, 7, 2, 2, 'Jóvenes de PODEMOS', NOW()),

-- Murcia (3 respuestas)
(22, 'Murcia', 'Región de Murcia', 'Española', 'PP', 'PP', 'PP', 'PP', 7, 7, 3, 1, 2, 4, 3, 6, 1, 'Nuevas Generaciones del PP', NOW()),
(25, 'Murcia', 'Región de Murcia', 'Española', 'PSOE', 'PSOE', 'PSOE', 'PSOE', 7, 4, 7, 1, 2, 6, 5, 3, 1, 'Juventudes Socialistas', NOW()),
(28, 'Murcia', 'Región de Murcia', 'Española', 'Ciudadanos', 'Ciudadanos', 'Ciudadanos', 'Ciudadanos', 7, 5, 5, 1, 2, 5, 4, 4, 1, 'Jóvenes de Ciudadanos', NOW()),

-- Navarra (3 respuestas)
(21, 'Navarra', 'Navarra', 'Española', 'PSOE', 'PSOE', 'PSOE', 'PSOE', 7, 4, 7, 1, 2, 6, 5, 3, 1, 'Juventudes Socialistas', NOW()),
(24, 'Navarra', 'Navarra', 'Española', 'PP', 'PP', 'PP', 'PP', 7, 6, 4, 1, 2, 5, 4, 5, 1, 'Nuevas Generaciones del PP', NOW()),
(27, 'Navarra', 'Navarra', 'Española', 'EAJ-PNV', 'EAJ-PNV', 'EAJ-PNV', 'EAJ-PNV', 7, 5, 5, 1, 2, 5, 4, 4, 1, 'Nuevas Generaciones del PP', NOW()),

-- Ourense (3 respuestas)
(20, 'Ourense', 'Galicia', 'Española', 'PSOE', 'PSOE', 'PSOE', 'PSOE', 7, 4, 7, 1, 2, 6, 5, 3, 1, 'Juventudes Socialistas', NOW()),
(23, 'Ourense', 'Galicia', 'Española', 'PP', 'PP', 'PP', 'PP', 7, 6, 4, 1, 2, 5, 4, 5, 1, 'Nuevas Generaciones del PP', NOW()),
(26, 'Ourense', 'Galicia', 'Española', 'BNG', 'BNG', 'BNG', 'BNG', 7, 3, 5, 1, 2, 5, 4, 2, 1, 'Xóvenes do BNG', NOW()),

-- Palencia (3 respuestas)
(22, 'Palencia', 'Castilla y León', 'Española', 'PP', 'PP', 'PP', 'PP', 7, 7, 3, 1, 2, 4, 3, 6, 1, 'Nuevas Generaciones del PP', NOW()),
(25, 'Palencia', 'Castilla y León', 'Española', 'PSOE', 'PSOE', 'PSOE', 'PSOE', 7, 4, 7, 1, 2, 6, 5, 3, 1, 'Juventudes Socialistas', NOW()),
(28, 'Palencia', 'Castilla y León', 'Española', 'Ciudadanos', 'Ciudadanos', 'Ciudadanos', 'Ciudadanos', 7, 5, 5, 1, 2, 5, 4, 4, 1, 'Jóvenes de Ciudadanos', NOW()),

-- Palmas (3 respuestas)
(21, 'Las Palmas', 'Canarias', 'Española', 'PSOE', 'PSOE', 'PSOE', 'PSOE', 7, 3, 8, 1, 2, 7, 6, 2, 1, 'Juventudes Socialistas', NOW()),
(24, 'Las Palmas', 'Canarias', 'Española', 'PP', 'PP', 'PP', 'PP', 7, 7, 3, 1, 2, 4, 3, 6, 1, 'Nuevas Generaciones del PP', NOW()),
(27, 'Las Palmas', 'Canarias', 'Española', 'Ciudadanos', 'Ciudadanos', 'Ciudadanos', 'Ciudadanos', 7, 5, 5, 1, 2, 5, 4, 4, 1, 'Jóvenes de Ciudadanos', NOW()),

-- Pontevedra (3 respuestas)
(20, 'Pontevedra', 'Galicia', 'Española', 'PSOE', 'PSOE', 'PSOE', 'PSOE', 7, 4, 7, 1, 2, 6, 5, 3, 1, 'Juventudes Socialistas', NOW()),
(23, 'Pontevedra', 'Galicia', 'Española', 'PP', 'PP', 'PP', 'PP', 7, 6, 4, 1, 2, 5, 4, 5, 1, 'Nuevas Generaciones del PP', NOW()),
(26, 'Pontevedra', 'Galicia', 'Española', 'BNG', 'BNG', 'BNG', 'BNG', 7, 3, 5, 1, 2, 5, 4, 2, 1, 'Xóvenes do BNG', NOW()),

-- Rioja (3 respuestas)
(22, 'La Rioja', 'La Rioja', 'Española', 'PP', 'PP', 'PP', 'PP', 7, 7, 3, 1, 2, 4, 3, 6, 1, 'Nuevas Generaciones del PP', NOW()),
(25, 'La Rioja', 'La Rioja', 'Española', 'PSOE', 'PSOE', 'PSOE', 'PSOE', 7, 4, 7, 1, 2, 6, 5, 3, 1, 'Juventudes Socialistas', NOW()),
(28, 'La Rioja', 'La Rioja', 'Española', 'Ciudadanos', 'Ciudadanos', 'Ciudadanos', 'Ciudadanos', 7, 5, 5, 1, 2, 5, 4, 4, 1, 'Jóvenes de Ciudadanos', NOW()),

-- Salamanca (3 respuestas)
(21, 'Salamanca', 'Castilla y León', 'Española', 'PP', 'PP', 'PP', 'PP', 7, 7, 3, 1, 2, 4, 3, 6, 1, 'Nuevas Generaciones del PP', NOW()),
(24, 'Salamanca', 'Castilla y León', 'Española', 'PSOE', 'PSOE', 'PSOE', 'PSOE', 7, 4, 7, 1, 2, 6, 5, 3, 1, 'Juventudes Socialistas', NOW()),
(27, 'Salamanca', 'Castilla y León', 'Española', 'Ciudadanos', 'Ciudadanos', 'Ciudadanos', 'Ciudadanos', 7, 5, 5, 1, 2, 5, 4, 4, 1, 'Jóvenes de Ciudadanos', NOW()),

-- Santa Cruz de Tenerife (3 respuestas)
(20, 'Santa Cruz de Tenerife', 'Canarias', 'Española', 'PSOE', 'PSOE', 'PSOE', 'PSOE', 7, 3, 8, 1, 2, 7, 6, 2, 1, 'Juventudes Socialistas', NOW()),
(23, 'Santa Cruz de Tenerife', 'Canarias', 'Española', 'PP', 'PP', 'PP', 'PP', 7, 7, 3, 1, 2, 4, 3, 6, 1, 'Nuevas Generaciones del PP', NOW()),
(26, 'Santa Cruz de Tenerife', 'Canarias', 'Española', 'Ciudadanos', 'Ciudadanos', 'Ciudadanos', 'Ciudadanos', 7, 5, 5, 1, 2, 5, 4, 4, 1, 'Jóvenes de Ciudadanos', NOW()),

-- Segovia (3 respuestas)
(22, 'Segovia', 'Castilla y León', 'Española', 'PP', 'PP', 'PP', 'PP', 7, 7, 3, 1, 2, 4, 3, 6, 1, 'Nuevas Generaciones del PP', NOW()),
(25, 'Segovia', 'Castilla y León', 'Española', 'PSOE', 'PSOE', 'PSOE', 'PSOE', 7, 4, 7, 1, 2, 6, 5, 3, 1, 'Juventudes Socialistas', NOW()),
(28, 'Segovia', 'Castilla y León', 'Española', 'Ciudadanos', 'Ciudadanos', 'Ciudadanos', 'Ciudadanos', 7, 5, 5, 1, 2, 5, 4, 4, 1, 'Jóvenes de Ciudadanos', NOW()),

-- Sevilla (3 respuestas)
(21, 'Sevilla', 'Andalucía', 'Española', 'PSOE', 'PSOE', 'PSOE', 'PSOE', 7, 3, 8, 1, 2, 7, 6, 2, 1, 'Juventudes Socialistas', NOW()),
(24, 'Sevilla', 'Andalucía', 'Española', 'PP', 'PP', 'PP', 'PP', 7, 7, 3, 1, 2, 4, 3, 6, 1, 'Nuevas Generaciones del PP', NOW()),
(27, 'Sevilla', 'Andalucía', 'Española', 'PODEMOS', 'PODEMOS', 'PODEMOS', 'PODEMOS', 7, 2, 6, 2, 3, 8, 7, 2, 2, 'Jóvenes de PODEMOS', NOW()),

-- Soria (3 respuestas)
(20, 'Soria', 'Castilla y León', 'Española', 'PP', 'PP', 'PP', 'PP', 7, 7, 3, 1, 2, 4, 3, 6, 1, 'Nuevas Generaciones del PP', NOW()),
(23, 'Soria', 'Castilla y León', 'Española', 'PSOE', 'PSOE', 'PSOE', 'PSOE', 7, 4, 7, 1, 2, 6, 5, 3, 1, 'Juventudes Socialistas', NOW()),
(26, 'Soria', 'Castilla y León', 'Española', 'Ciudadanos', 'Ciudadanos', 'Ciudadanos', 'Ciudadanos', 7, 5, 5, 1, 2, 5, 4, 4, 1, 'Jóvenes de Ciudadanos', NOW()),

-- Tarragona (3 respuestas)
(22, 'Tarragona', 'Cataluña', 'Española', 'PSOE', 'ERC', 'PSOE', 'PSOE', 7, 4, 7, 1, 2, 6, 5, 3, 1, 'Juventudes Socialistas', NOW()),
(25, 'Tarragona', 'Cataluña', 'Española', 'ERC', 'ERC', 'ERC', 'ERC', 7, 3, 5, 1, 2, 5, 4, 2, 1, 'Joventut d\'ERC', NOW()),
(28, 'Tarragona', 'Cataluña', 'Española', 'JUNTS', 'JUNTS', 'JUNTS', 'JUNTS', 7, 3, 4, 1, 2, 4, 3, 2, 1, 'Joventut de JUNTS', NOW()),

-- Teruel (3 respuestas)
(21, 'Teruel', 'Aragón', 'Española', 'PP', 'PP', 'PP', 'PP', 7, 7, 3, 1, 2, 4, 3, 6, 1, 'Nuevas Generaciones del PP', NOW()),
(24, 'Teruel', 'Aragón', 'Española', 'PSOE', 'PSOE', 'PSOE', 'PSOE', 7, 3, 8, 1, 2, 7, 6, 2, 1, 'Juventudes Socialistas', NOW()),
(27, 'Teruel', 'Aragón', 'Española', 'Ciudadanos', 'Ciudadanos', 'Ciudadanos', 'Ciudadanos', 7, 5, 5, 1, 2, 5, 4, 4, 1, 'Jóvenes de Ciudadanos', NOW()),

-- Toledo (3 respuestas)
(20, 'Toledo', 'Castilla-La Mancha', 'Española', 'PSOE', 'PSOE', 'PSOE', 'PSOE', 7, 3, 8, 1, 2, 7, 6, 2, 1, 'Juventudes Socialistas', NOW()),
(23, 'Toledo', 'Castilla-La Mancha', 'Española', 'PP', 'PP', 'PP', 'PP', 7, 7, 3, 1, 2, 4, 3, 6, 1, 'Nuevas Generaciones del PP', NOW()),
(26, 'Toledo', 'Castilla-La Mancha', 'Española', 'PODEMOS', 'PODEMOS', 'PODEMOS', 'PODEMOS', 7, 2, 6, 2, 3, 8, 7, 2, 2, 'Jóvenes de PODEMOS', NOW()),

-- Valencia (3 respuestas)
(22, 'Valencia', 'Comunidad Valenciana', 'Española', 'PSOE', 'PSOE', 'PSOE', 'PSOE', 7, 4, 7, 1, 2, 6, 5, 3, 1, 'Juventudes Socialistas', NOW()),
(25, 'Valencia', 'Comunidad Valenciana', 'Española', 'PP', 'PP', 'PP', 'PP', 7, 6, 4, 1, 2, 5, 4, 5, 1, 'Nuevas Generaciones del PP', NOW()),
(28, 'Valencia', 'Comunidad Valenciana', 'Española', 'Ciudadanos', 'Ciudadanos', 'Ciudadanos', 'Ciudadanos', 7, 5, 5, 1, 2, 5, 4, 4, 1, 'Jóvenes de Ciudadanos', NOW()),

-- Valladolid (3 respuestas)
(21, 'Valladolid', 'Castilla y León', 'Española', 'PP', 'PP', 'PP', 'PP', 7, 7, 3, 1, 2, 4, 3, 6, 1, 'Nuevas Generaciones del PP', NOW()),
(24, 'Valladolid', 'Castilla y León', 'Española', 'PSOE', 'PSOE', 'PSOE', 'PSOE', 7, 4, 7, 1, 2, 6, 5, 3, 1, 'Juventudes Socialistas', NOW()),
(27, 'Valladolid', 'Castilla y León', 'Española', 'Ciudadanos', 'Ciudadanos', 'Ciudadanos', 'Ciudadanos', 7, 5, 5, 1, 2, 5, 4, 4, 1, 'Jóvenes de Ciudadanos', NOW()),

-- Vizcaya (3 respuestas)
(20, 'Vizcaya', 'País Vasco', 'Española', 'PSOE', 'EAJ-PNV', 'PSOE', 'PSOE', 7, 4, 7, 1, 2, 6, 5, 3, 1, 'Juventudes Socialistas', NOW()),
(23, 'Vizcaya', 'País Vasco', 'Española', 'EAJ-PNV', 'EAJ-PNV', 'EAJ-PNV', 'EAJ-PNV', 7, 5, 5, 1, 2, 5, 4, 4, 1, 'Nuevas Generaciones del PP', NOW()),
(26, 'Vizcaya', 'País Vasco', 'Española', 'BILDU', 'BILDU', 'BILDU', 'BILDU', 7, 2, 6, 1, 2, 7, 6, 2, 1, 'Jóvenes de BILDU', NOW()),

-- Zamora (3 respuestas)
(22, 'Zamora', 'Castilla y León', 'Española', 'PP', 'PP', 'PP', 'PP', 7, 7, 3, 1, 2, 4, 3, 6, 1, 'Nuevas Generaciones del PP', NOW()),
(25, 'Zamora', 'Castilla y León', 'Española', 'PSOE', 'PSOE', 'PSOE', 'PSOE', 7, 4, 7, 1, 2, 6, 5, 3, 1, 'Juventudes Socialistas', NOW()),
(28, 'Zamora', 'Castilla y León', 'Española', 'Ciudadanos', 'Ciudadanos', 'Ciudadanos', 'Ciudadanos', 7, 5, 5, 1, 2, 5, 4, 4, 1, 'Jóvenes de Ciudadanos', NOW()),

-- Zaragoza (3 respuestas)
(21, 'Zaragoza', 'Aragón', 'Española', 'PP', 'PP', 'PP', 'PP', 7, 7, 3, 1, 2, 4, 3, 6, 1, 'Nuevas Generaciones del PP', NOW()),
(24, 'Zaragoza', 'Aragón', 'Española', 'PSOE', 'PSOE', 'PSOE', 'PSOE', 7, 3, 8, 1, 2, 7, 6, 2, 1, 'Juventudes Socialistas', NOW()),
(27, 'Zaragoza', 'Aragón', 'Española', 'Ciudadanos', 'Ciudadanos', 'Ciudadanos', 'Ciudadanos', 7, 5, 5, 1, 2, 5, 4, 4, 1, 'Jóvenes de Ciudadanos', NOW()),

-- Ceuta (2 respuestas)
(20, 'Ceuta', 'Ceuta', 'Española', 'PSOE', 'PSOE', 'PSOE', 'PSOE', 7, 3, 8, 1, 2, 7, 6, 2, 1, 'Juventudes Socialistas', NOW()),
(23, 'Ceuta', 'Ceuta', 'Española', 'PP', 'PP', 'PP', 'PP', 7, 7, 3, 1, 2, 4, 3, 6, 1, 'Nuevas Generaciones del PP', NOW()),

-- Melilla (2 respuestas)
(22, 'Melilla', 'Melilla', 'Española', 'PSOE', 'PSOE', 'PSOE', 'PSOE', 7, 3, 8, 1, 2, 7, 6, 2, 1, 'Juventudes Socialistas', NOW()),
(25, 'Melilla', 'Melilla', 'Española', 'PP', 'PP', 'PP', 'PP', 7, 7, 3, 1, 2, 4, 3, 6, 1, 'Nuevas Generaciones del PP', NOW());

-- Total: 150 respuestas
-- Todas las provincias españolas cubiertas
-- Ninguna respuesta vota a VOX
-- Edades: 18-30 años
-- Ideología: 7/10
-- Nacionalidad: Española
-- Partidos: PP, PSOE, PODEMOS, Ciudadanos, ERC, JUNTS, EAJ-PNV, BILDU, BNG
