-- Script para insertar 300 respuestas de NanoEncuestaBC
-- Distribuidas entre todas las provincias españolas (6 respuestas por provincia)
-- Edades: 18-30 años
-- Ideología: 7/10
-- Partidos: PP, PSOE, PODEMOS, Ciudadanos, ERC, JUNTS, EAJ-PNV, BILDU, BNG (SIN VOX)
-- Nacionalidad: Española
-- Asociaciones Juveniles correctas:
-- - BNG: Galiza Nova
-- - JUNTS: Joventut Nacionalista de Catalunya
-- - ERC: Joventuts d'Esquerra Republicana de Catalunya
-- - PNV: EGI
-- - BILDU: ERNAI

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
-- ÁLAVA (6 respuestas)
(23, 'Álava', 'País Vasco', 'Española', 'PP', 'EAJ-PNV', 'PP', 'PP', 7, 6, 4, 2, 3, 5, 4, 5, 2, 'Nuevas Generaciones del PP', NOW()),
(26, 'Álava', 'País Vasco', 'Española', 'PSOE', 'EAJ-PNV', 'PSOE', 'PSOE', 7, 4, 7, 1, 2, 6, 5, 3, 1, 'Juventudes Socialistas', NOW()),
(29, 'Álava', 'País Vasco', 'Española', 'EAJ-PNV', 'EAJ-PNV', 'EAJ-PNV', 'EAJ-PNV', 7, 5, 5, 2, 3, 5, 4, 4, 2, 'EGI', NOW()),
(20, 'Álava', 'País Vasco', 'Española', 'PP', 'EAJ-PNV', 'PP', 'PP', 7, 7, 3, 1, 2, 4, 3, 6, 1, 'Nuevas Generaciones del PP', NOW()),
(25, 'Álava', 'País Vasco', 'Española', 'PSOE', 'EAJ-PNV', 'PSOE', 'PSOE', 7, 3, 8, 1, 2, 7, 6, 2, 1, 'Juventudes Socialistas', NOW()),
(28, 'Álava', 'País Vasco', 'Española', 'PODEMOS', 'PODEMOS', 'PODEMOS', 'PODEMOS', 7, 2, 6, 2, 3, 8, 7, 2, 2, 'Jóvenes de PODEMOS', NOW()),

-- ALBACETE (6 respuestas)
(22, 'Albacete', 'Castilla-La Mancha', 'Española', 'PP', 'PP', 'PP', 'PP', 7, 7, 3, 1, 2, 4, 3, 6, 1, 'Nuevas Generaciones del PP', NOW()),
(25, 'Albacete', 'Castilla-La Mancha', 'Española', 'PSOE', 'PSOE', 'PSOE', 'PSOE', 7, 3, 8, 1, 2, 7, 6, 2, 1, 'Juventudes Socialistas', NOW()),
(28, 'Albacete', 'Castilla-La Mancha', 'Española', 'PODEMOS', 'PODEMOS', 'PODEMOS', 'PODEMOS', 7, 2, 6, 2, 3, 8, 7, 2, 2, 'Jóvenes de PODEMOS', NOW()),
(21, 'Albacete', 'Castilla-La Mancha', 'Española', 'PP', 'PP', 'PP', 'PP', 7, 6, 4, 1, 2, 5, 4, 5, 1, 'Nuevas Generaciones del PP', NOW()),
(24, 'Albacete', 'Castilla-La Mancha', 'Española', 'PSOE', 'PSOE', 'PSOE', 'PSOE', 7, 4, 7, 2, 3, 6, 5, 3, 2, 'Juventudes Socialistas', NOW()),
(27, 'Albacete', 'Castilla-La Mancha', 'Española', 'Ciudadanos', 'Ciudadanos', 'Ciudadanos', 'Ciudadanos', 7, 5, 5, 1, 2, 5, 4, 4, 1, 'Jóvenes de Ciudadanos', NOW()),

-- ALICANTE (6 respuestas)
(21, 'Alicante', 'Comunidad Valenciana', 'Española', 'PP', 'PP', 'PP', 'PP', 7, 6, 4, 1, 2, 5, 4, 5, 1, 'Nuevas Generaciones del PP', NOW()),
(24, 'Alicante', 'Comunidad Valenciana', 'Española', 'PSOE', 'PSOE', 'PSOE', 'PSOE', 7, 4, 7, 2, 3, 6, 5, 3, 2, 'Juventudes Socialistas', NOW()),
(27, 'Alicante', 'Comunidad Valenciana', 'Española', 'Ciudadanos', 'Ciudadanos', 'Ciudadanos', 'Ciudadanos', 7, 5, 5, 1, 2, 5, 4, 4, 1, 'Jóvenes de Ciudadanos', NOW()),
(20, 'Alicante', 'Comunidad Valenciana', 'Española', 'PP', 'PP', 'PP', 'PP', 7, 7, 2, 1, 2, 4, 3, 6, 1, 'Nuevas Generaciones del PP', NOW()),
(23, 'Alicante', 'Comunidad Valenciana', 'Española', 'PSOE', 'PSOE', 'PSOE', 'PSOE', 7, 3, 8, 1, 2, 7, 6, 2, 1, 'Juventudes Socialistas', NOW()),
(26, 'Alicante', 'Comunidad Valenciana', 'Española', 'PODEMOS', 'PODEMOS', 'PODEMOS', 'PODEMOS', 7, 2, 6, 2, 3, 8, 7, 2, 2, 'Jóvenes de PODEMOS', NOW()),

-- ALMERÍA (6 respuestas)
(20, 'Almería', 'Andalucía', 'Española', 'PP', 'PP', 'PP', 'PP', 7, 7, 2, 1, 2, 4, 3, 6, 1, 'Nuevas Generaciones del PP', NOW()),
(23, 'Almería', 'Andalucía', 'Española', 'PSOE', 'PSOE', 'PSOE', 'PSOE', 7, 3, 8, 1, 2, 7, 6, 2, 1, 'Juventudes Socialistas', NOW()),
(26, 'Almería', 'Andalucía', 'Española', 'PODEMOS', 'PODEMOS', 'PODEMOS', 'PODEMOS', 7, 2, 6, 2, 3, 8, 7, 2, 2, 'Jóvenes de PODEMOS', NOW()),
(22, 'Almería', 'Andalucía', 'Española', 'PP', 'PP', 'PP', 'PP', 7, 6, 4, 1, 2, 5, 4, 5, 1, 'Nuevas Generaciones del PP', NOW()),
(25, 'Almería', 'Andalucía', 'Española', 'PSOE', 'PSOE', 'PSOE', 'PSOE', 7, 4, 7, 1, 2, 6, 5, 3, 1, 'Juventudes Socialistas', NOW()),
(28, 'Almería', 'Andalucía', 'Española', 'Ciudadanos', 'Ciudadanos', 'Ciudadanos', 'Ciudadanos', 7, 5, 5, 1, 2, 5, 4, 4, 1, 'Jóvenes de Ciudadanos', NOW()),

-- ÁVILA (6 respuestas)
(22, 'Ávila', 'Castilla y León', 'Española', 'PP', 'PP', 'PP', 'PP', 7, 7, 3, 1, 2, 4, 3, 6, 1, 'Nuevas Generaciones del PP', NOW()),
(25, 'Ávila', 'Castilla y León', 'Española', 'PSOE', 'PSOE', 'PSOE', 'PSOE', 7, 4, 7, 1, 2, 6, 5, 3, 1, 'Juventudes Socialistas', NOW()),
(28, 'Ávila', 'Castilla y León', 'Española', 'Ciudadanos', 'Ciudadanos', 'Ciudadanos', 'Ciudadanos', 7, 5, 5, 1, 2, 5, 4, 4, 1, 'Jóvenes de Ciudadanos', NOW()),
(21, 'Ávila', 'Castilla y León', 'Española', 'PP', 'PP', 'PP', 'PP', 7, 6, 4, 1, 2, 5, 4, 5, 1, 'Nuevas Generaciones del PP', NOW()),
(24, 'Ávila', 'Castilla y León', 'Española', 'PSOE', 'PSOE', 'PSOE', 'PSOE', 7, 4, 7, 2, 3, 6, 5, 3, 2, 'Juventudes Socialistas', NOW()),
(27, 'Ávila', 'Castilla y León', 'Española', 'PODEMOS', 'PODEMOS', 'PODEMOS', 'PODEMOS', 7, 2, 6, 2, 3, 8, 7, 2, 2, 'Jóvenes de PODEMOS', NOW()),

-- BADAJOZ (6 respuestas)
(21, 'Badajoz', 'Extremadura', 'Española', 'PSOE', 'PSOE', 'PSOE', 'PSOE', 7, 3, 8, 1, 2, 7, 6, 2, 1, 'Juventudes Socialistas', NOW()),
(24, 'Badajoz', 'Extremadura', 'Española', 'PP', 'PP', 'PP', 'PP', 7, 7, 3, 1, 2, 4, 3, 6, 1, 'Nuevas Generaciones del PP', NOW()),
(27, 'Badajoz', 'Extremadura', 'Española', 'PODEMOS', 'PODEMOS', 'PODEMOS', 'PODEMOS', 7, 2, 6, 2, 3, 8, 7, 2, 2, 'Jóvenes de PODEMOS', NOW()),
(20, 'Badajoz', 'Extremadura', 'Española', 'PSOE', 'PSOE', 'PSOE', 'PSOE', 7, 4, 7, 1, 2, 6, 5, 3, 1, 'Juventudes Socialistas', NOW()),
(23, 'Badajoz', 'Extremadura', 'Española', 'PP', 'PP', 'PP', 'PP', 7, 6, 4, 1, 2, 5, 4, 5, 1, 'Nuevas Generaciones del PP', NOW()),
(26, 'Badajoz', 'Extremadura', 'Española', 'Ciudadanos', 'Ciudadanos', 'Ciudadanos', 'Ciudadanos', 7, 5, 5, 1, 2, 5, 4, 4, 1, 'Jóvenes de Ciudadanos', NOW()),

-- BALEARES (6 respuestas)
(20, 'Baleares', 'Islas Baleares', 'Española', 'PSOE', 'PSOE', 'PSOE', 'PSOE', 7, 4, 7, 1, 2, 6, 5, 3, 1, 'Juventudes Socialistas', NOW()),
(23, 'Baleares', 'Islas Baleares', 'Española', 'PP', 'PP', 'PP', 'PP', 7, 6, 4, 1, 2, 5, 4, 5, 1, 'Nuevas Generaciones del PP', NOW()),
(26, 'Baleares', 'Islas Baleares', 'Española', 'Ciudadanos', 'Ciudadanos', 'Ciudadanos', 'Ciudadanos', 7, 5, 5, 1, 2, 5, 4, 4, 1, 'Jóvenes de Ciudadanos', NOW()),
(22, 'Baleares', 'Islas Baleares', 'Española', 'PSOE', 'PSOE', 'PSOE', 'PSOE', 7, 3, 8, 1, 2, 7, 6, 2, 1, 'Juventudes Socialistas', NOW()),
(25, 'Baleares', 'Islas Baleares', 'Española', 'PP', 'PP', 'PP', 'PP', 7, 7, 3, 1, 2, 4, 3, 6, 1, 'Nuevas Generaciones del PP', NOW()),
(28, 'Baleares', 'Islas Baleares', 'Española', 'PODEMOS', 'PODEMOS', 'PODEMOS', 'PODEMOS', 7, 2, 6, 2, 3, 8, 7, 2, 2, 'Jóvenes de PODEMOS', NOW()),

-- BARCELONA (6 respuestas)
(22, 'Barcelona', 'Cataluña', 'Española', 'PSOE', 'ERC', 'PSOE', 'PSOE', 7, 4, 7, 1, 2, 6, 5, 3, 1, 'Juventudes Socialistas', NOW()),
(25, 'Barcelona', 'Cataluña', 'Española', 'ERC', 'ERC', 'ERC', 'ERC', 7, 3, 5, 1, 2, 5, 4, 2, 1, 'Joventuts d''Esquerra Republicana de Catalunya', NOW()),
(28, 'Barcelona', 'Cataluña', 'Española', 'JUNTS', 'JUNTS', 'JUNTS', 'JUNTS', 7, 3, 4, 1, 2, 4, 3, 2, 1, 'Joventut Nacionalista de Catalunya', NOW()),
(21, 'Barcelona', 'Cataluña', 'Española', 'PSOE', 'PSOE', 'PSOE', 'PSOE', 7, 3, 8, 1, 2, 7, 6, 2, 1, 'Juventudes Socialistas', NOW()),
(24, 'Barcelona', 'Cataluña', 'Española', 'ERC', 'ERC', 'ERC', 'ERC', 7, 3, 5, 1, 2, 5, 4, 2, 1, 'Joventuts d''Esquerra Republicana de Catalunya', NOW()),
(27, 'Barcelona', 'Cataluña', 'Española', 'JUNTS', 'JUNTS', 'JUNTS', 'JUNTS', 7, 3, 4, 1, 2, 4, 3, 2, 1, 'Joventut Nacionalista de Catalunya', NOW()),

-- BURGOS (6 respuestas)
(21, 'Burgos', 'Castilla y León', 'Española', 'PP', 'PP', 'PP', 'PP', 7, 7, 3, 1, 2, 4, 3, 6, 1, 'Nuevas Generaciones del PP', NOW()),
(24, 'Burgos', 'Castilla y León', 'Española', 'PSOE', 'PSOE', 'PSOE', 'PSOE', 7, 4, 7, 1, 2, 6, 5, 3, 1, 'Juventudes Socialistas', NOW()),
(27, 'Burgos', 'Castilla y León', 'Española', 'Ciudadanos', 'Ciudadanos', 'Ciudadanos', 'Ciudadanos', 7, 5, 5, 1, 2, 5, 4, 4, 1, 'Jóvenes de Ciudadanos', NOW()),
(20, 'Burgos', 'Castilla y León', 'Española', 'PP', 'PP', 'PP', 'PP', 7, 6, 4, 1, 2, 5, 4, 5, 1, 'Nuevas Generaciones del PP', NOW()),
(23, 'Burgos', 'Castilla y León', 'Española', 'PSOE', 'PSOE', 'PSOE', 'PSOE', 7, 3, 8, 1, 2, 7, 6, 2, 1, 'Juventudes Socialistas', NOW()),
(26, 'Burgos', 'Castilla y León', 'Española', 'PODEMOS', 'PODEMOS', 'PODEMOS', 'PODEMOS', 7, 2, 6, 2, 3, 8, 7, 2, 2, 'Jóvenes de PODEMOS', NOW()),

-- CÁCERES (6 respuestas)
(20, 'Cáceres', 'Extremadura', 'Española', 'PSOE', 'PSOE', 'PSOE', 'PSOE', 7, 3, 8, 1, 2, 7, 6, 2, 1, 'Juventudes Socialistas', NOW()),
(23, 'Cáceres', 'Extremadura', 'Española', 'PP', 'PP', 'PP', 'PP', 7, 7, 3, 1, 2, 4, 3, 6, 1, 'Nuevas Generaciones del PP', NOW()),
(26, 'Cáceres', 'Extremadura', 'Española', 'PODEMOS', 'PODEMOS', 'PODEMOS', 'PODEMOS', 7, 2, 6, 2, 3, 8, 7, 2, 2, 'Jóvenes de PODEMOS', NOW()),
(22, 'Cáceres', 'Extremadura', 'Española', 'PSOE', 'PSOE', 'PSOE', 'PSOE', 7, 4, 7, 1, 2, 6, 5, 3, 1, 'Juventudes Socialistas', NOW()),
(25, 'Cáceres', 'Extremadura', 'Española', 'PP', 'PP', 'PP', 'PP', 7, 6, 4, 1, 2, 5, 4, 5, 1, 'Nuevas Generaciones del PP', NOW()),
(28, 'Cáceres', 'Extremadura', 'Española', 'Ciudadanos', 'Ciudadanos', 'Ciudadanos', 'Ciudadanos', 7, 5, 5, 1, 2, 5, 4, 4, 1, 'Jóvenes de Ciudadanos', NOW()),

-- CÁDIZ (6 respuestas)
(22, 'Cádiz', 'Andalucía', 'Española', 'PSOE', 'PSOE', 'PSOE', 'PSOE', 7, 3, 8, 1, 2, 7, 6, 2, 1, 'Juventudes Socialistas', NOW()),
(25, 'Cádiz', 'Andalucía', 'Española', 'PP', 'PP', 'PP', 'PP', 7, 7, 3, 1, 2, 4, 3, 6, 1, 'Nuevas Generaciones del PP', NOW()),
(28, 'Cádiz', 'Andalucía', 'Española', 'PODEMOS', 'PODEMOS', 'PODEMOS', 'PODEMOS', 7, 2, 6, 2, 3, 8, 7, 2, 2, 'Jóvenes de PODEMOS', NOW()),
(21, 'Cádiz', 'Andalucía', 'Española', 'PSOE', 'PSOE', 'PSOE', 'PSOE', 7, 4, 7, 1, 2, 6, 5, 3, 1, 'Juventudes Socialistas', NOW()),
(24, 'Cádiz', 'Andalucía', 'Española', 'PP', 'PP', 'PP', 'PP', 7, 6, 4, 1, 2, 5, 4, 5, 1, 'Nuevas Generaciones del PP', NOW()),
(27, 'Cádiz', 'Andalucía', 'Española', 'Ciudadanos', 'Ciudadanos', 'Ciudadanos', 'Ciudadanos', 7, 5, 5, 1, 2, 5, 4, 4, 1, 'Jóvenes de Ciudadanos', NOW()),

-- CASTELLÓN (6 respuestas)
(21, 'Castellón', 'Comunidad Valenciana', 'Española', 'PP', 'PP', 'PP', 'PP', 7, 6, 4, 1, 2, 5, 4, 5, 1, 'Nuevas Generaciones del PP', NOW()),
(24, 'Castellón', 'Comunidad Valenciana', 'Española', 'PSOE', 'PSOE', 'PSOE', 'PSOE', 7, 4, 7, 1, 2, 6, 5, 3, 1, 'Juventudes Socialistas', NOW()),
(27, 'Castellón', 'Comunidad Valenciana', 'Española', 'Ciudadanos', 'Ciudadanos', 'Ciudadanos', 'Ciudadanos', 7, 5, 5, 1, 2, 5, 4, 4, 1, 'Jóvenes de Ciudadanos', NOW()),
(20, 'Castellón', 'Comunidad Valenciana', 'Española', 'PP', 'PP', 'PP', 'PP', 7, 7, 2, 1, 2, 4, 3, 6, 1, 'Nuevas Generaciones del PP', NOW()),
(23, 'Castellón', 'Comunidad Valenciana', 'Española', 'PSOE', 'PSOE', 'PSOE', 'PSOE', 7, 3, 8, 1, 2, 7, 6, 2, 1, 'Juventudes Socialistas', NOW()),
(26, 'Castellón', 'Comunidad Valenciana', 'Española', 'PODEMOS', 'PODEMOS', 'PODEMOS', 'PODEMOS', 7, 2, 6, 2, 3, 8, 7, 2, 2, 'Jóvenes de PODEMOS', NOW()),

-- CIUDAD REAL (6 respuestas)
(20, 'Ciudad Real', 'Castilla-La Mancha', 'Española', 'PSOE', 'PSOE', 'PSOE', 'PSOE', 7, 3, 8, 1, 2, 7, 6, 2, 1, 'Juventudes Socialistas', NOW()),
(23, 'Ciudad Real', 'Castilla-La Mancha', 'Española', 'PP', 'PP', 'PP', 'PP', 7, 7, 3, 1, 2, 4, 3, 6, 1, 'Nuevas Generaciones del PP', NOW()),
(26, 'Ciudad Real', 'Castilla-La Mancha', 'Española', 'PODEMOS', 'PODEMOS', 'PODEMOS', 'PODEMOS', 7, 2, 6, 2, 3, 8, 7, 2, 2, 'Jóvenes de PODEMOS', NOW()),
(22, 'Ciudad Real', 'Castilla-La Mancha', 'Española', 'PSOE', 'PSOE', 'PSOE', 'PSOE', 7, 4, 7, 1, 2, 6, 5, 3, 1, 'Juventudes Socialistas', NOW()),
(25, 'Ciudad Real', 'Castilla-La Mancha', 'Española', 'PP', 'PP', 'PP', 'PP', 7, 6, 4, 1, 2, 5, 4, 5, 1, 'Nuevas Generaciones del PP', NOW()),
(28, 'Ciudad Real', 'Castilla-La Mancha', 'Española', 'Ciudadanos', 'Ciudadanos', 'Ciudadanos', 'Ciudadanos', 7, 5, 5, 1, 2, 5, 4, 4, 1, 'Jóvenes de Ciudadanos', NOW()),

-- CÓRDOBA (6 respuestas)
(22, 'Córdoba', 'Andalucía', 'Española', 'PSOE', 'PSOE', 'PSOE', 'PSOE', 7, 3, 8, 1, 2, 7, 6, 2, 1, 'Juventudes Socialistas', NOW()),
(25, 'Córdoba', 'Andalucía', 'Española', 'PP', 'PP', 'PP', 'PP', 7, 7, 3, 1, 2, 4, 3, 6, 1, 'Nuevas Generaciones del PP', NOW()),
(28, 'Córdoba', 'Andalucía', 'Española', 'PODEMOS', 'PODEMOS', 'PODEMOS', 'PODEMOS', 7, 2, 6, 2, 3, 8, 7, 2, 2, 'Jóvenes de PODEMOS', NOW()),
(21, 'Córdoba', 'Andalucía', 'Española', 'PSOE', 'PSOE', 'PSOE', 'PSOE', 7, 4, 7, 1, 2, 6, 5, 3, 1, 'Juventudes Socialistas', NOW()),
(24, 'Córdoba', 'Andalucía', 'Española', 'PP', 'PP', 'PP', 'PP', 7, 6, 4, 1, 2, 5, 4, 5, 1, 'Nuevas Generaciones del PP', NOW()),
(27, 'Córdoba', 'Andalucía', 'Española', 'Ciudadanos', 'Ciudadanos', 'Ciudadanos', 'Ciudadanos', 7, 5, 5, 1, 2, 5, 4, 4, 1, 'Jóvenes de Ciudadanos', NOW()),

-- CORUÑA (6 respuestas)
(21, 'Coruña', 'Galicia', 'Española', 'PSOE', 'PSOE', 'PSOE', 'PSOE', 7, 4, 7, 1, 2, 6, 5, 3, 1, 'Juventudes Socialistas', NOW()),
(24, 'Coruña', 'Galicia', 'Española', 'PP', 'PP', 'PP', 'PP', 7, 6, 4, 1, 2, 5, 4, 5, 1, 'Nuevas Generaciones del PP', NOW()),
(27, 'Coruña', 'Galicia', 'Española', 'BNG', 'BNG', 'BNG', 'BNG', 7, 3, 5, 1, 2, 5, 4, 2, 1, 'Galiza Nova', NOW()),
(20, 'Coruña', 'Galicia', 'Española', 'PSOE', 'PSOE', 'PSOE', 'PSOE', 7, 3, 8, 1, 2, 7, 6, 2, 1, 'Juventudes Socialistas', NOW()),
(23, 'Coruña', 'Galicia', 'Española', 'PP', 'PP', 'PP', 'PP', 7, 7, 3, 1, 2, 4, 3, 6, 1, 'Nuevas Generaciones del PP', NOW()),
(26, 'Coruña', 'Galicia', 'Española', 'PODEMOS', 'PODEMOS', 'PODEMOS', 'PODEMOS', 7, 2, 6, 2, 3, 8, 7, 2, 2, 'Jóvenes de PODEMOS', NOW()),

-- CUENCA (6 respuestas)
(20, 'Cuenca', 'Castilla-La Mancha', 'Española', 'PP', 'PP', 'PP', 'PP', 7, 7, 3, 1, 2, 4, 3, 6, 1, 'Nuevas Generaciones del PP', NOW()),
(23, 'Cuenca', 'Castilla-La Mancha', 'Española', 'PSOE', 'PSOE', 'PSOE', 'PSOE', 7, 3, 8, 1, 2, 7, 6, 2, 1, 'Juventudes Socialistas', NOW()),
(26, 'Cuenca', 'Castilla-La Mancha', 'Española', 'Ciudadanos', 'Ciudadanos', 'Ciudadanos', 'Ciudadanos', 7, 5, 5, 1, 2, 5, 4, 4, 1, 'Jóvenes de Ciudadanos', NOW()),
(22, 'Cuenca', 'Castilla-La Mancha', 'Española', 'PP', 'PP', 'PP', 'PP', 7, 6, 4, 1, 2, 5, 4, 5, 1, 'Nuevas Generaciones del PP', NOW()),
(25, 'Cuenca', 'Castilla-La Mancha', 'Española', 'PSOE', 'PSOE', 'PSOE', 'PSOE', 7, 4, 7, 1, 2, 6, 5, 3, 1, 'Juventudes Socialistas', NOW()),
(28, 'Cuenca', 'Castilla-La Mancha', 'Española', 'PODEMOS', 'PODEMOS', 'PODEMOS', 'PODEMOS', 7, 2, 6, 2, 3, 8, 7, 2, 2, 'Jóvenes de PODEMOS', NOW()),

-- GIRONA (6 respuestas)
(22, 'Girona', 'Cataluña', 'Española', 'PSOE', 'ERC', 'PSOE', 'PSOE', 7, 4, 7, 1, 2, 6, 5, 3, 1, 'Juventudes Socialistas', NOW()),
(25, 'Girona', 'Cataluña', 'Española', 'ERC', 'ERC', 'ERC', 'ERC', 7, 3, 5, 1, 2, 5, 4, 2, 1, 'Joventuts d''Esquerra Republicana de Catalunya', NOW()),
(28, 'Girona', 'Cataluña', 'Española', 'JUNTS', 'JUNTS', 'JUNTS', 'JUNTS', 7, 3, 4, 1, 2, 4, 3, 2, 1, 'Joventut Nacionalista de Catalunya', NOW()),
(21, 'Girona', 'Cataluña', 'Española', 'PSOE', 'PSOE', 'PSOE', 'PSOE', 7, 3, 8, 1, 2, 7, 6, 2, 1, 'Juventudes Socialistas', NOW()),
(24, 'Girona', 'Cataluña', 'Española', 'ERC', 'ERC', 'ERC', 'ERC', 7, 3, 5, 1, 2, 5, 4, 2, 1, 'Joventuts d''Esquerra Republicana de Catalunya', NOW()),
(27, 'Girona', 'Cataluña', 'Española', 'JUNTS', 'JUNTS', 'JUNTS', 'JUNTS', 7, 3, 4, 1, 2, 4, 3, 2, 1, 'Joventut Nacionalista de Catalunya', NOW()),

-- GRANADA (6 respuestas)
(21, 'Granada', 'Andalucía', 'Española', 'PSOE', 'PSOE', 'PSOE', 'PSOE', 7, 3, 8, 1, 2, 7, 6, 2, 1, 'Juventudes Socialistas', NOW()),
(24, 'Granada', 'Andalucía', 'Española', 'PP', 'PP', 'PP', 'PP', 7, 7, 3, 1, 2, 4, 3, 6, 1, 'Nuevas Generaciones del PP', NOW()),
(27, 'Granada', 'Andalucía', 'Española', 'PODEMOS', 'PODEMOS', 'PODEMOS', 'PODEMOS', 7, 2, 6, 2, 3, 8, 7, 2, 2, 'Jóvenes de PODEMOS', NOW()),
(20, 'Granada', 'Andalucía', 'Española', 'PSOE', 'PSOE', 'PSOE', 'PSOE', 7, 4, 7, 1, 2, 6, 5, 3, 1, 'Juventudes Socialistas', NOW()),
(23, 'Granada', 'Andalucía', 'Española', 'PP', 'PP', 'PP', 'PP', 7, 6, 4, 1, 2, 5, 4, 5, 1, 'Nuevas Generaciones del PP', NOW()),
(26, 'Granada', 'Andalucía', 'Española', 'Ciudadanos', 'Ciudadanos', 'Ciudadanos', 'Ciudadanos', 7, 5, 5, 1, 2, 5, 4, 4, 1, 'Jóvenes de Ciudadanos', NOW()),

-- GUADALAJARA (6 respuestas)
(20, 'Guadalajara', 'Castilla-La Mancha', 'Española', 'PP', 'PP', 'PP', 'PP', 7, 7, 3, 1, 2, 4, 3, 6, 1, 'Nuevas Generaciones del PP', NOW()),
(23, 'Guadalajara', 'Castilla-La Mancha', 'Española', 'PSOE', 'PSOE', 'PSOE', 'PSOE', 7, 3, 8, 1, 2, 7, 6, 2, 1, 'Juventudes Socialistas', NOW()),
(26, 'Guadalajara', 'Castilla-La Mancha', 'Española', 'Ciudadanos', 'Ciudadanos', 'Ciudadanos', 'Ciudadanos', 7, 5, 5, 1, 2, 5, 4, 4, 1, 'Jóvenes de Ciudadanos', NOW()),
(22, 'Guadalajara', 'Castilla-La Mancha', 'Española', 'PP', 'PP', 'PP', 'PP', 7, 6, 4, 1, 2, 5, 4, 5, 1, 'Nuevas Generaciones del PP', NOW()),
(25, 'Guadalajara', 'Castilla-La Mancha', 'Española', 'PSOE', 'PSOE', 'PSOE', 'PSOE', 7, 4, 7, 1, 2, 6, 5, 3, 1, 'Juventudes Socialistas', NOW()),
(28, 'Guadalajara', 'Castilla-La Mancha', 'Española', 'PODEMOS', 'PODEMOS', 'PODEMOS', 'PODEMOS', 7, 2, 6, 2, 3, 8, 7, 2, 2, 'Jóvenes de PODEMOS', NOW()),

-- GUIPÚZCOA (6 respuestas)
(22, 'Guipúzcoa', 'País Vasco', 'Española', 'PSOE', 'EAJ-PNV', 'PSOE', 'PSOE', 7, 4, 7, 1, 2, 6, 5, 3, 1, 'Juventudes Socialistas', NOW()),
(25, 'Guipúzcoa', 'País Vasco', 'Española', 'EAJ-PNV', 'EAJ-PNV', 'EAJ-PNV', 'EAJ-PNV', 7, 5, 5, 1, 2, 5, 4, 4, 1, 'EGI', NOW()),
(28, 'Guipúzcoa', 'País Vasco', 'Española', 'BILDU', 'BILDU', 'BILDU', 'BILDU', 7, 2, 6, 1, 2, 7, 6, 2, 1, 'ERNAI', NOW()),
(21, 'Guipúzcoa', 'País Vasco', 'Española', 'PSOE', 'EAJ-PNV', 'PSOE', 'PSOE', 7, 3, 8, 1, 2, 7, 6, 2, 1, 'Juventudes Socialistas', NOW()),
(24, 'Guipúzcoa', 'País Vasco', 'Española', 'EAJ-PNV', 'EAJ-PNV', 'EAJ-PNV', 'EAJ-PNV', 7, 5, 5, 1, 2, 5, 4, 4, 1, 'EGI', NOW()),
(27, 'Guipúzcoa', 'País Vasco', 'Española', 'BILDU', 'BILDU', 'BILDU', 'BILDU', 7, 2, 6, 1, 2, 7, 6, 2, 1, 'ERNAI', NOW()),

-- HUELVA (6 respuestas)
(21, 'Huelva', 'Andalucía', 'Española', 'PSOE', 'PSOE', 'PSOE', 'PSOE', 7, 3, 8, 1, 2, 7, 6, 2, 1, 'Juventudes Socialistas', NOW()),
(24, 'Huelva', 'Andalucía', 'Española', 'PP', 'PP', 'PP', 'PP', 7, 7, 3, 1, 2, 4, 3, 6, 1, 'Nuevas Generaciones del PP', NOW()),
(27, 'Huelva', 'Andalucía', 'Española', 'PODEMOS', 'PODEMOS', 'PODEMOS', 'PODEMOS', 7, 2, 6, 2, 3, 8, 7, 2, 2, 'Jóvenes de PODEMOS', NOW()),
(20, 'Huelva', 'Andalucía', 'Española', 'PSOE', 'PSOE', 'PSOE', 'PSOE', 7, 4, 7, 1, 2, 6, 5, 3, 1, 'Juventudes Socialistas', NOW()),
(23, 'Huelva', 'Andalucía', 'Española', 'PP', 'PP', 'PP', 'PP', 7, 6, 4, 1, 2, 5, 4, 5, 1, 'Nuevas Generaciones del PP', NOW()),
(26, 'Huelva', 'Andalucía', 'Española', 'Ciudadanos', 'Ciudadanos', 'Ciudadanos', 'Ciudadanos', 7, 5, 5, 1, 2, 5, 4, 4, 1, 'Jóvenes de Ciudadanos', NOW()),

-- HUESCA (6 respuestas)
(20, 'Huesca', 'Aragón', 'Española', 'PP', 'PP', 'PP', 'PP', 7, 7, 3, 1, 2, 4, 3, 6, 1, 'Nuevas Generaciones del PP', NOW()),
(23, 'Huesca', 'Aragón', 'Española', 'PSOE', 'PSOE', 'PSOE', 'PSOE', 7, 3, 8, 1, 2, 7, 6, 2, 1, 'Juventudes Socialistas', NOW()),
(26, 'Huesca', 'Aragón', 'Española', 'Ciudadanos', 'Ciudadanos', 'Ciudadanos', 'Ciudadanos', 7, 5, 5, 1, 2, 5, 4, 4, 1, 'Jóvenes de Ciudadanos', NOW()),
(22, 'Huesca', 'Aragón', 'Española', 'PP', 'PP', 'PP', 'PP', 7, 6, 4, 1, 2, 5, 4, 5, 1, 'Nuevas Generaciones del PP', NOW()),
(25, 'Huesca', 'Aragón', 'Española', 'PSOE', 'PSOE', 'PSOE', 'PSOE', 7, 4, 7, 1, 2, 6, 5, 3, 1, 'Juventudes Socialistas', NOW()),
(28, 'Huesca', 'Aragón', 'Española', 'PODEMOS', 'PODEMOS', 'PODEMOS', 'PODEMOS', 7, 2, 6, 2, 3, 8, 7, 2, 2, 'Jóvenes de PODEMOS', NOW()),

-- JAÉN (6 respuestas)
(22, 'Jaén', 'Andalucía', 'Española', 'PSOE', 'PSOE', 'PSOE', 'PSOE', 7, 3, 8, 1, 2, 7, 6, 2, 1, 'Juventudes Socialistas', NOW()),
(25, 'Jaén', 'Andalucía', 'Española', 'PP', 'PP', 'PP', 'PP', 7, 7, 3, 1, 2, 4, 3, 6, 1, 'Nuevas Generaciones del PP', NOW()),
(28, 'Jaén', 'Andalucía', 'Española', 'PODEMOS', 'PODEMOS', 'PODEMOS', 'PODEMOS', 7, 2, 6, 2, 3, 8, 7, 2, 2, 'Jóvenes de PODEMOS', NOW()),
(21, 'Jaén', 'Andalucía', 'Española', 'PSOE', 'PSOE', 'PSOE', 'PSOE', 7, 4, 7, 1, 2, 6, 5, 3, 1, 'Juventudes Socialistas', NOW()),
(24, 'Jaén', 'Andalucía', 'Española', 'PP', 'PP', 'PP', 'PP', 7, 6, 4, 1, 2, 5, 4, 5, 1, 'Nuevas Generaciones del PP', NOW()),
(27, 'Jaén', 'Andalucía', 'Española', 'Ciudadanos', 'Ciudadanos', 'Ciudadanos', 'Ciudadanos', 7, 5, 5, 1, 2, 5, 4, 4, 1, 'Jóvenes de Ciudadanos', NOW()),

-- LEÓN (6 respuestas)
(21, 'León', 'Castilla y León', 'Española', 'PP', 'PP', 'PP', 'PP', 7, 7, 3, 1, 2, 4, 3, 6, 1, 'Nuevas Generaciones del PP', NOW()),
(24, 'León', 'Castilla y León', 'Española', 'PSOE', 'PSOE', 'PSOE', 'PSOE', 7, 4, 7, 1, 2, 6, 5, 3, 1, 'Juventudes Socialistas', NOW()),
(27, 'León', 'Castilla y León', 'Española', 'Ciudadanos', 'Ciudadanos', 'Ciudadanos', 'Ciudadanos', 7, 5, 5, 1, 2, 5, 4, 4, 1, 'Jóvenes de Ciudadanos', NOW()),
(20, 'León', 'Castilla y León', 'Española', 'PP', 'PP', 'PP', 'PP', 7, 6, 4, 1, 2, 5, 4, 5, 1, 'Nuevas Generaciones del PP', NOW()),
(23, 'León', 'Castilla y León', 'Española', 'PSOE', 'PSOE', 'PSOE', 'PSOE', 7, 3, 8, 1, 2, 7, 6, 2, 1, 'Juventudes Socialistas', NOW()),
(26, 'León', 'Castilla y León', 'Española', 'PODEMOS', 'PODEMOS', 'PODEMOS', 'PODEMOS', 7, 2, 6, 2, 3, 8, 7, 2, 2, 'Jóvenes de PODEMOS', NOW()),

-- LLEIDA (6 respuestas)
(20, 'Lleida', 'Cataluña', 'Española', 'PSOE', 'ERC', 'PSOE', 'PSOE', 7, 4, 7, 1, 2, 6, 5, 3, 1, 'Juventudes Socialistas', NOW()),
(23, 'Lleida', 'Cataluña', 'Española', 'ERC', 'ERC', 'ERC', 'ERC', 7, 3, 5, 1, 2, 5, 4, 2, 1, 'Joventuts d''Esquerra Republicana de Catalunya', NOW()),
(26, 'Lleida', 'Cataluña', 'Española', 'JUNTS', 'JUNTS', 'JUNTS', 'JUNTS', 7, 3, 4, 1, 2, 4, 3, 2, 1, 'Joventut Nacionalista de Catalunya', NOW()),
(22, 'Lleida', 'Cataluña', 'Española', 'PSOE', 'PSOE', 'PSOE', 'PSOE', 7, 3, 8, 1, 2, 7, 6, 2, 1, 'Juventudes Socialistas', NOW()),
(25, 'Lleida', 'Cataluña', 'Española', 'ERC', 'ERC', 'ERC', 'ERC', 7, 3, 5, 1, 2, 5, 4, 2, 1, 'Joventuts d''Esquerra Republicana de Catalunya', NOW()),
(28, 'Lleida', 'Cataluña', 'Española', 'JUNTS', 'JUNTS', 'JUNTS', 'JUNTS', 7, 3, 4, 1, 2, 4, 3, 2, 1, 'Joventut Nacionalista de Catalunya', NOW()),

-- LUGO (6 respuestas)
(22, 'Lugo', 'Galicia', 'Española', 'PSOE', 'PSOE', 'PSOE', 'PSOE', 7, 4, 7, 1, 2, 6, 5, 3, 1, 'Juventudes Socialistas', NOW()),
(25, 'Lugo', 'Galicia', 'Española', 'PP', 'PP', 'PP', 'PP', 7, 6, 4, 1, 2, 5, 4, 5, 1, 'Nuevas Generaciones del PP', NOW()),
(28, 'Lugo', 'Galicia', 'Española', 'BNG', 'BNG', 'BNG', 'BNG', 7, 3, 5, 1, 2, 5, 4, 2, 1, 'Galiza Nova', NOW()),
(21, 'Lugo', 'Galicia', 'Española', 'PSOE', 'PSOE', 'PSOE', 'PSOE', 7, 3, 8, 1, 2, 7, 6, 2, 1, 'Juventudes Socialistas', NOW()),
(24, 'Lugo', 'Galicia', 'Española', 'PP', 'PP', 'PP', 'PP', 7, 7, 3, 1, 2, 4, 3, 6, 1, 'Nuevas Generaciones del PP', NOW()),
(27, 'Lugo', 'Galicia', 'Española', 'PODEMOS', 'PODEMOS', 'PODEMOS', 'PODEMOS', 7, 2, 6, 2, 3, 8, 7, 2, 2, 'Jóvenes de PODEMOS', NOW()),

-- MADRID (6 respuestas)
(21, 'Madrid', 'Madrid', 'Española', 'PP', 'PP', 'PP', 'PP', 7, 7, 3, 1, 2, 4, 3, 6, 1, 'Nuevas Generaciones del PP', NOW()),
(24, 'Madrid', 'Madrid', 'Española', 'PSOE', 'PSOE', 'PSOE', 'PSOE', 7, 4, 7, 1, 2, 6, 5, 3, 1, 'Juventudes Socialistas', NOW()),
(27, 'Madrid', 'Madrid', 'Española', 'PODEMOS', 'PODEMOS', 'PODEMOS', 'PODEMOS', 7, 2, 6, 2, 3, 8, 7, 2, 2, 'Jóvenes de PODEMOS', NOW()),
(20, 'Madrid', 'Madrid', 'Española', 'PP', 'PP', 'PP', 'PP', 7, 6, 4, 1, 2, 5, 4, 5, 1, 'Nuevas Generaciones del PP', NOW()),
(23, 'Madrid', 'Madrid', 'Española', 'PSOE', 'PSOE', 'PSOE', 'PSOE', 7, 3, 8, 1, 2, 7, 6, 2, 1, 'Juventudes Socialistas', NOW()),
(26, 'Madrid', 'Madrid', 'Española', 'Ciudadanos', 'Ciudadanos', 'Ciudadanos', 'Ciudadanos', 7, 5, 5, 1, 2, 5, 4, 4, 1, 'Jóvenes de Ciudadanos', NOW()),

-- MÁLAGA (6 respuestas)
(20, 'Málaga', 'Andalucía', 'Española', 'PSOE', 'PSOE', 'PSOE', 'PSOE', 7, 3, 8, 1, 2, 7, 6, 2, 1, 'Juventudes Socialistas', NOW()),
(23, 'Málaga', 'Andalucía', 'Española', 'PP', 'PP', 'PP', 'PP', 7, 7, 3, 1, 2, 4, 3, 6, 1, 'Nuevas Generaciones del PP', NOW()),
(26, 'Málaga', 'Andalucía', 'Española', 'PODEMOS', 'PODEMOS', 'PODEMOS', 'PODEMOS', 7, 2, 6, 2, 3, 8, 7, 2, 2, 'Jóvenes de PODEMOS', NOW()),
(22, 'Málaga', 'Andalucía', 'Española', 'PSOE', 'PSOE', 'PSOE', 'PSOE', 7, 4, 7, 1, 2, 6, 5, 3, 1, 'Juventudes Socialistas', NOW()),
(25, 'Málaga', 'Andalucía', 'Española', 'PP', 'PP', 'PP', 'PP', 7, 6, 4, 1, 2, 5, 4, 5, 1, 'Nuevas Generaciones del PP', NOW()),
(28, 'Málaga', 'Andalucía', 'Española', 'Ciudadanos', 'Ciudadanos', 'Ciudadanos', 'Ciudadanos', 7, 5, 5, 1, 2, 5, 4, 4, 1, 'Jóvenes de Ciudadanos', NOW()),

-- MURCIA (6 respuestas)
(22, 'Murcia', 'Región de Murcia', 'Española', 'PP', 'PP', 'PP', 'PP', 7, 7, 3, 1, 2, 4, 3, 6, 1, 'Nuevas Generaciones del PP', NOW()),
(25, 'Murcia', 'Región de Murcia', 'Española', 'PSOE', 'PSOE', 'PSOE', 'PSOE', 7, 4, 7, 1, 2, 6, 5, 3, 1, 'Juventudes Socialistas', NOW()),
(28, 'Murcia', 'Región de Murcia', 'Española', 'Ciudadanos', 'Ciudadanos', 'Ciudadanos', 'Ciudadanos', 7, 5, 5, 1, 2, 5, 4, 4, 1, 'Jóvenes de Ciudadanos', NOW()),
(21, 'Murcia', 'Región de Murcia', 'Española', 'PP', 'PP', 'PP', 'PP', 7, 6, 4, 1, 2, 5, 4, 5, 1, 'Nuevas Generaciones del PP', NOW()),
(24, 'Murcia', 'Región de Murcia', 'Española', 'PSOE', 'PSOE', 'PSOE', 'PSOE', 7, 3, 8, 1, 2, 7, 6, 2, 1, 'Juventudes Socialistas', NOW()),
(27, 'Murcia', 'Región de Murcia', 'Española', 'PODEMOS', 'PODEMOS', 'PODEMOS', 'PODEMOS', 7, 2, 6, 2, 3, 8, 7, 2, 2, 'Jóvenes de PODEMOS', NOW()),

-- NAVARRA (6 respuestas)
(21, 'Navarra', 'Navarra', 'Española', 'PSOE', 'PSOE', 'PSOE', 'PSOE', 7, 4, 7, 1, 2, 6, 5, 3, 1, 'Juventudes Socialistas', NOW()),
(24, 'Navarra', 'Navarra', 'Española', 'PP', 'PP', 'PP', 'PP', 7, 6, 4, 1, 2, 5, 4, 5, 1, 'Nuevas Generaciones del PP', NOW()),
(27, 'Navarra', 'Navarra', 'Española', 'EAJ-PNV', 'EAJ-PNV', 'EAJ-PNV', 'EAJ-PNV', 7, 5, 5, 1, 2, 5, 4, 4, 1, 'EGI', NOW()),
(20, 'Navarra', 'Navarra', 'Española', 'PSOE', 'PSOE', 'PSOE', 'PSOE', 7, 3, 8, 1, 2, 7, 6, 2, 1, 'Juventudes Socialistas', NOW()),
(23, 'Navarra', 'Navarra', 'Española', 'PP', 'PP', 'PP', 'PP', 7, 7, 3, 1, 2, 4, 3, 6, 1, 'Nuevas Generaciones del PP', NOW()),
(26, 'Navarra', 'Navarra', 'Española', 'PODEMOS', 'PODEMOS', 'PODEMOS', 'PODEMOS', 7, 2, 6, 2, 3, 8, 7, 2, 2, 'Jóvenes de PODEMOS', NOW()),

-- OURENSE (6 respuestas)
(20, 'Ourense', 'Galicia', 'Española', 'PSOE', 'PSOE', 'PSOE', 'PSOE', 7, 4, 7, 1, 2, 6, 5, 3, 1, 'Juventudes Socialistas', NOW()),
(23, 'Ourense', 'Galicia', 'Española', 'PP', 'PP', 'PP', 'PP', 7, 6, 4, 1, 2, 5, 4, 5, 1, 'Nuevas Generaciones del PP', NOW()),
(26, 'Ourense', 'Galicia', 'Española', 'BNG', 'BNG', 'BNG', 'BNG', 7, 3, 5, 1, 2, 5, 4, 2, 1, 'Galiza Nova', NOW()),
(22, 'Ourense', 'Galicia', 'Española', 'PSOE', 'PSOE', 'PSOE', 'PSOE', 7, 3, 8, 1, 2, 7, 6, 2, 1, 'Juventudes Socialistas', NOW()),
(25, 'Ourense', 'Galicia', 'Española', 'PP', 'PP', 'PP', 'PP', 7, 7, 3, 1, 2, 4, 3, 6, 1, 'Nuevas Generaciones del PP', NOW()),
(28, 'Ourense', 'Galicia', 'Española', 'PODEMOS', 'PODEMOS', 'PODEMOS', 'PODEMOS', 7, 2, 6, 2, 3, 8, 7, 2, 2, 'Jóvenes de PODEMOS', NOW()),

-- PALENCIA (6 respuestas)
(22, 'Palencia', 'Castilla y León', 'Española', 'PP', 'PP', 'PP', 'PP', 7, 7, 3, 1, 2, 4, 3, 6, 1, 'Nuevas Generaciones del PP', NOW()),
(25, 'Palencia', 'Castilla y León', 'Española', 'PSOE', 'PSOE', 'PSOE', 'PSOE', 7, 4, 7, 1, 2, 6, 5, 3, 1, 'Juventudes Socialistas', NOW()),
(28, 'Palencia', 'Castilla y León', 'Española', 'Ciudadanos', 'Ciudadanos', 'Ciudadanos', 'Ciudadanos', 7, 5, 5, 1, 2, 5, 4, 4, 1, 'Jóvenes de Ciudadanos', NOW()),
(21, 'Palencia', 'Castilla y León', 'Española', 'PP', 'PP', 'PP', 'PP', 7, 6, 4, 1, 2, 5, 4, 5, 1, 'Nuevas Generaciones del PP', NOW()),
(24, 'Palencia', 'Castilla y León', 'Española', 'PSOE', 'PSOE', 'PSOE', 'PSOE', 7, 3, 8, 1, 2, 7, 6, 2, 1, 'Juventudes Socialistas', NOW()),
(27, 'Palencia', 'Castilla y León', 'Española', 'PODEMOS', 'PODEMOS', 'PODEMOS', 'PODEMOS', 7, 2, 6, 2, 3, 8, 7, 2, 2, 'Jóvenes de PODEMOS', NOW()),

-- LAS PALMAS (6 respuestas)
(21, 'Las Palmas', 'Canarias', 'Española', 'PSOE', 'PSOE', 'PSOE', 'PSOE', 7, 3, 8, 1, 2, 7, 6, 2, 1, 'Juventudes Socialistas', NOW()),
(24, 'Las Palmas', 'Canarias', 'Española', 'PP', 'PP', 'PP', 'PP', 7, 7, 3, 1, 2, 4, 3, 6, 1, 'Nuevas Generaciones del PP', NOW()),
(27, 'Las Palmas', 'Canarias', 'Española', 'Ciudadanos', 'Ciudadanos', 'Ciudadanos', 'Ciudadanos', 7, 5, 5, 1, 2, 5, 4, 4, 1, 'Jóvenes de Ciudadanos', NOW()),
(20, 'Las Palmas', 'Canarias', 'Española', 'PSOE', 'PSOE', 'PSOE', 'PSOE', 7, 4, 7, 1, 2, 6, 5, 3, 1, 'Juventudes Socialistas', NOW()),
(23, 'Las Palmas', 'Canarias', 'Española', 'PP', 'PP', 'PP', 'PP', 7, 6, 4, 1, 2, 5, 4, 5, 1, 'Nuevas Generaciones del PP', NOW()),
(26, 'Las Palmas', 'Canarias', 'Española', 'PODEMOS', 'PODEMOS', 'PODEMOS', 'PODEMOS', 7, 2, 6, 2, 3, 8, 7, 2, 2, 'Jóvenes de PODEMOS', NOW()),

-- PONTEVEDRA (6 respuestas)
(20, 'Pontevedra', 'Galicia', 'Española', 'PSOE', 'PSOE', 'PSOE', 'PSOE', 7, 4, 7, 1, 2, 6, 5, 3, 1, 'Juventudes Socialistas', NOW()),
(23, 'Pontevedra', 'Galicia', 'Española', 'PP', 'PP', 'PP', 'PP', 7, 6, 4, 1, 2, 5, 4, 5, 1, 'Nuevas Generaciones del PP', NOW()),
(26, 'Pontevedra', 'Galicia', 'Española', 'BNG', 'BNG', 'BNG', 'BNG', 7, 3, 5, 1, 2, 5, 4, 2, 1, 'Galiza Nova', NOW()),
(22, 'Pontevedra', 'Galicia', 'Española', 'PSOE', 'PSOE', 'PSOE', 'PSOE', 7, 3, 8, 1, 2, 7, 6, 2, 1, 'Juventudes Socialistas', NOW()),
(25, 'Pontevedra', 'Galicia', 'Española', 'PP', 'PP', 'PP', 'PP', 7, 7, 3, 1, 2, 4, 3, 6, 1, 'Nuevas Generaciones del PP', NOW()),
(28, 'Pontevedra', 'Galicia', 'Española', 'PODEMOS', 'PODEMOS', 'PODEMOS', 'PODEMOS', 7, 2, 6, 2, 3, 8, 7, 2, 2, 'Jóvenes de PODEMOS', NOW()),

-- LA RIOJA (6 respuestas)
(22, 'La Rioja', 'La Rioja', 'Española', 'PP', 'PP', 'PP', 'PP', 7, 7, 3, 1, 2, 4, 3, 6, 1, 'Nuevas Generaciones del PP', NOW()),
(25, 'La Rioja', 'La Rioja', 'Española', 'PSOE', 'PSOE', 'PSOE', 'PSOE', 7, 4, 7, 1, 2, 6, 5, 3, 1, 'Juventudes Socialistas', NOW()),
(28, 'La Rioja', 'La Rioja', 'Española', 'Ciudadanos', 'Ciudadanos', 'Ciudadanos', 'Ciudadanos', 7, 5, 5, 1, 2, 5, 4, 4, 1, 'Jóvenes de Ciudadanos', NOW()),
(21, 'La Rioja', 'La Rioja', 'Española', 'PP', 'PP', 'PP', 'PP', 7, 6, 4, 1, 2, 5, 4, 5, 1, 'Nuevas Generaciones del PP', NOW()),
(24, 'La Rioja', 'La Rioja', 'Española', 'PSOE', 'PSOE', 'PSOE', 'PSOE', 7, 3, 8, 1, 2, 7, 6, 2, 1, 'Juventudes Socialistas', NOW()),
(27, 'La Rioja', 'La Rioja', 'Española', 'PODEMOS', 'PODEMOS', 'PODEMOS', 'PODEMOS', 7, 2, 6, 2, 3, 8, 7, 2, 2, 'Jóvenes de PODEMOS', NOW()),

-- SALAMANCA (6 respuestas)
(21, 'Salamanca', 'Castilla y León', 'Española', 'PP', 'PP', 'PP', 'PP', 7, 7, 3, 1, 2, 4, 3, 6, 1, 'Nuevas Generaciones del PP', NOW()),
(24, 'Salamanca', 'Castilla y León', 'Española', 'PSOE', 'PSOE', 'PSOE', 'PSOE', 7, 4, 7, 1, 2, 6, 5, 3, 1, 'Juventudes Socialistas', NOW()),
(27, 'Salamanca', 'Castilla y León', 'Española', 'Ciudadanos', 'Ciudadanos', 'Ciudadanos', 'Ciudadanos', 7, 5, 5, 1, 2, 5, 4, 4, 1, 'Jóvenes de Ciudadanos', NOW()),
(20, 'Salamanca', 'Castilla y León', 'Española', 'PP', 'PP', 'PP', 'PP', 7, 6, 4, 1, 2, 5, 4, 5, 1, 'Nuevas Generaciones del PP', NOW()),
(23, 'Salamanca', 'Castilla y León', 'Española', 'PSOE', 'PSOE', 'PSOE', 'PSOE', 7, 3, 8, 1, 2, 7, 6, 2, 1, 'Juventudes Socialistas', NOW()),
(26, 'Salamanca', 'Castilla y León', 'Española', 'PODEMOS', 'PODEMOS', 'PODEMOS', 'PODEMOS', 7, 2, 6, 2, 3, 8, 7, 2, 2, 'Jóvenes de PODEMOS', NOW()),

-- SANTA CRUZ DE TENERIFE (6 respuestas)
(20, 'Santa Cruz de Tenerife', 'Canarias', 'Española', 'PSOE', 'PSOE', 'PSOE', 'PSOE', 7, 3, 8, 1, 2, 7, 6, 2, 1, 'Juventudes Socialistas', NOW()),
(23, 'Santa Cruz de Tenerife', 'Canarias', 'Española', 'PP', 'PP', 'PP', 'PP', 7, 7, 3, 1, 2, 4, 3, 6, 1, 'Nuevas Generaciones del PP', NOW()),
(26, 'Santa Cruz de Tenerife', 'Canarias', 'Española', 'Ciudadanos', 'Ciudadanos', 'Ciudadanos', 'Ciudadanos', 7, 5, 5, 1, 2, 5, 4, 4, 1, 'Jóvenes de Ciudadanos', NOW()),
(22, 'Santa Cruz de Tenerife', 'Canarias', 'Española', 'PSOE', 'PSOE', 'PSOE', 'PSOE', 7, 4, 7, 1, 2, 6, 5, 3, 1, 'Juventudes Socialistas', NOW()),
(25, 'Santa Cruz de Tenerife', 'Canarias', 'Española', 'PP', 'PP', 'PP', 'PP', 7, 6, 4, 1, 2, 5, 4, 5, 1, 'Nuevas Generaciones del PP', NOW()),
(28, 'Santa Cruz de Tenerife', 'Canarias', 'Española', 'PODEMOS', 'PODEMOS', 'PODEMOS', 'PODEMOS', 7, 2, 6, 2, 3, 8, 7, 2, 2, 'Jóvenes de PODEMOS', NOW()),

-- SEGOVIA (6 respuestas)
(22, 'Segovia', 'Castilla y León', 'Española', 'PP', 'PP', 'PP', 'PP', 7, 7, 3, 1, 2, 4, 3, 6, 1, 'Nuevas Generaciones del PP', NOW()),
(25, 'Segovia', 'Castilla y León', 'Española', 'PSOE', 'PSOE', 'PSOE', 'PSOE', 7, 4, 7, 1, 2, 6, 5, 3, 1, 'Juventudes Socialistas', NOW()),
(28, 'Segovia', 'Castilla y León', 'Española', 'Ciudadanos', 'Ciudadanos', 'Ciudadanos', 'Ciudadanos', 7, 5, 5, 1, 2, 5, 4, 4, 1, 'Jóvenes de Ciudadanos', NOW()),
(21, 'Segovia', 'Castilla y León', 'Española', 'PP', 'PP', 'PP', 'PP', 7, 6, 4, 1, 2, 5, 4, 5, 1, 'Nuevas Generaciones del PP', NOW()),
(24, 'Segovia', 'Castilla y León', 'Española', 'PSOE', 'PSOE', 'PSOE', 'PSOE', 7, 3, 8, 1, 2, 7, 6, 2, 1, 'Juventudes Socialistas', NOW()),
(27, 'Segovia', 'Castilla y León', 'Española', 'PODEMOS', 'PODEMOS', 'PODEMOS', 'PODEMOS', 7, 2, 6, 2, 3, 8, 7, 2, 2, 'Jóvenes de PODEMOS', NOW()),

-- SEVILLA (6 respuestas)
(21, 'Sevilla', 'Andalucía', 'Española', 'PSOE', 'PSOE', 'PSOE', 'PSOE', 7, 3, 8, 1, 2, 7, 6, 2, 1, 'Juventudes Socialistas', NOW()),
(24, 'Sevilla', 'Andalucía', 'Española', 'PP', 'PP', 'PP', 'PP', 7, 7, 3, 1, 2, 4, 3, 6, 1, 'Nuevas Generaciones del PP', NOW()),
(27, 'Sevilla', 'Andalucía', 'Española', 'PODEMOS', 'PODEMOS', 'PODEMOS', 'PODEMOS', 7, 2, 6, 2, 3, 8, 7, 2, 2, 'Jóvenes de PODEMOS', NOW()),
(20, 'Sevilla', 'Andalucía', 'Española', 'PSOE', 'PSOE', 'PSOE', 'PSOE', 7, 4, 7, 1, 2, 6, 5, 3, 1, 'Juventudes Socialistas', NOW()),
(23, 'Sevilla', 'Andalucía', 'Española', 'PP', 'PP', 'PP', 'PP', 7, 6, 4, 1, 2, 5, 4, 5, 1, 'Nuevas Generaciones del PP', NOW()),
(26, 'Sevilla', 'Andalucía', 'Española', 'Ciudadanos', 'Ciudadanos', 'Ciudadanos', 'Ciudadanos', 7, 5, 5, 1, 2, 5, 4, 4, 1, 'Jóvenes de Ciudadanos', NOW()),

-- SORIA (6 respuestas)
(20, 'Soria', 'Castilla y León', 'Española', 'PP', 'PP', 'PP', 'PP', 7, 7, 3, 1, 2, 4, 3, 6, 1, 'Nuevas Generaciones del PP', NOW()),
(23, 'Soria', 'Castilla y León', 'Española', 'PSOE', 'PSOE', 'PSOE', 'PSOE', 7, 4, 7, 1, 2, 6, 5, 3, 1, 'Juventudes Socialistas', NOW()),
(26, 'Soria', 'Castilla y León', 'Española', 'Ciudadanos', 'Ciudadanos', 'Ciudadanos', 'Ciudadanos', 7, 5, 5, 1, 2, 5, 4, 4, 1, 'Jóvenes de Ciudadanos', NOW()),
(22, 'Soria', 'Castilla y León', 'Española', 'PP', 'PP', 'PP', 'PP', 7, 6, 4, 1, 2, 5, 4, 5, 1, 'Nuevas Generaciones del PP', NOW()),
(25, 'Soria', 'Castilla y León', 'Española', 'PSOE', 'PSOE', 'PSOE', 'PSOE', 7, 3, 8, 1, 2, 7, 6, 2, 1, 'Juventudes Socialistas', NOW()),
(28, 'Soria', 'Castilla y León', 'Española', 'PODEMOS', 'PODEMOS', 'PODEMOS', 'PODEMOS', 7, 2, 6, 2, 3, 8, 7, 2, 2, 'Jóvenes de PODEMOS', NOW()),

-- TARRAGONA (6 respuestas)
(22, 'Tarragona', 'Cataluña', 'Española', 'PSOE', 'ERC', 'PSOE', 'PSOE', 7, 4, 7, 1, 2, 6, 5, 3, 1, 'Juventudes Socialistas', NOW()),
(25, 'Tarragona', 'Cataluña', 'Española', 'ERC', 'ERC', 'ERC', 'ERC', 7, 3, 5, 1, 2, 5, 4, 2, 1, 'Joventuts d''Esquerra Republicana de Catalunya', NOW()),
(28, 'Tarragona', 'Cataluña', 'Española', 'JUNTS', 'JUNTS', 'JUNTS', 'JUNTS', 7, 3, 4, 1, 2, 4, 3, 2, 1, 'Joventut Nacionalista de Catalunya', NOW()),
(21, 'Tarragona', 'Cataluña', 'Española', 'PSOE', 'PSOE', 'PSOE', 'PSOE', 7, 3, 8, 1, 2, 7, 6, 2, 1, 'Juventudes Socialistas', NOW()),
(24, 'Tarragona', 'Cataluña', 'Española', 'ERC', 'ERC', 'ERC', 'ERC', 7, 3, 5, 1, 2, 5, 4, 2, 1, 'Joventuts d''Esquerra Republicana de Catalunya', NOW()),
(27, 'Tarragona', 'Cataluña', 'Española', 'JUNTS', 'JUNTS', 'JUNTS', 'JUNTS', 7, 3, 4, 1, 2, 4, 3, 2, 1, 'Joventut Nacionalista de Catalunya', NOW()),

-- TERUEL (6 respuestas)
(21, 'Teruel', 'Aragón', 'Española', 'PP', 'PP', 'PP', 'PP', 7, 7, 3, 1, 2, 4, 3, 6, 1, 'Nuevas Generaciones del PP', NOW()),
(24, 'Teruel', 'Aragón', 'Española', 'PSOE', 'PSOE', 'PSOE', 'PSOE', 7, 3, 8, 1, 2, 7, 6, 2, 1, 'Juventudes Socialistas', NOW()),
(27, 'Teruel', 'Aragón', 'Española', 'Ciudadanos', 'Ciudadanos', 'Ciudadanos', 'Ciudadanos', 7, 5, 5, 1, 2, 5, 4, 4, 1, 'Jóvenes de Ciudadanos', NOW()),
(20, 'Teruel', 'Aragón', 'Española', 'PP', 'PP', 'PP', 'PP', 7, 6, 4, 1, 2, 5, 4, 5, 1, 'Nuevas Generaciones del PP', NOW()),
(23, 'Teruel', 'Aragón', 'Española', 'PSOE', 'PSOE', 'PSOE', 'PSOE', 7, 4, 7, 1, 2, 6, 5, 3, 1, 'Juventudes Socialistas', NOW()),
(26, 'Teruel', 'Aragón', 'Española', 'PODEMOS', 'PODEMOS', 'PODEMOS', 'PODEMOS', 7, 2, 6, 2, 3, 8, 7, 2, 2, 'Jóvenes de PODEMOS', NOW()),

-- TOLEDO (6 respuestas)
(20, 'Toledo', 'Castilla-La Mancha', 'Española', 'PSOE', 'PSOE', 'PSOE', 'PSOE', 7, 3, 8, 1, 2, 7, 6, 2, 1, 'Juventudes Socialistas', NOW()),
(23, 'Toledo', 'Castilla-La Mancha', 'Española', 'PP', 'PP', 'PP', 'PP', 7, 7, 3, 1, 2, 4, 3, 6, 1, 'Nuevas Generaciones del PP', NOW()),
(26, 'Toledo', 'Castilla-La Mancha', 'Española', 'PODEMOS', 'PODEMOS', 'PODEMOS', 'PODEMOS', 7, 2, 6, 2, 3, 8, 7, 2, 2, 'Jóvenes de PODEMOS', NOW()),
(22, 'Toledo', 'Castilla-La Mancha', 'Española', 'PSOE', 'PSOE', 'PSOE', 'PSOE', 7, 4, 7, 1, 2, 6, 5, 3, 1, 'Juventudes Socialistas', NOW()),
(25, 'Toledo', 'Castilla-La Mancha', 'Española', 'PP', 'PP', 'PP', 'PP', 7, 6, 4, 1, 2, 5, 4, 5, 1, 'Nuevas Generaciones del PP', NOW()),
(28, 'Toledo', 'Castilla-La Mancha', 'Española', 'Ciudadanos', 'Ciudadanos', 'Ciudadanos', 'Ciudadanos', 7, 5, 5, 1, 2, 5, 4, 4, 1, 'Jóvenes de Ciudadanos', NOW()),

-- VALENCIA (6 respuestas)
(22, 'Valencia', 'Comunidad Valenciana', 'Española', 'PSOE', 'PSOE', 'PSOE', 'PSOE', 7, 4, 7, 1, 2, 6, 5, 3, 1, 'Juventudes Socialistas', NOW()),
(25, 'Valencia', 'Comunidad Valenciana', 'Española', 'PP', 'PP', 'PP', 'PP', 7, 6, 4, 1, 2, 5, 4, 5, 1, 'Nuevas Generaciones del PP', NOW()),
(28, 'Valencia', 'Comunidad Valenciana', 'Española', 'Ciudadanos', 'Ciudadanos', 'Ciudadanos', 'Ciudadanos', 7, 5, 5, 1, 2, 5, 4, 4, 1, 'Jóvenes de Ciudadanos', NOW()),
(21, 'Valencia', 'Comunidad Valenciana', 'Española', 'PSOE', 'PSOE', 'PSOE', 'PSOE', 7, 3, 8, 1, 2, 7, 6, 2, 1, 'Juventudes Socialistas', NOW()),
(24, 'Valencia', 'Comunidad Valenciana', 'Española', 'PP', 'PP', 'PP', 'PP', 7, 7, 3, 1, 2, 4, 3, 6, 1, 'Nuevas Generaciones del PP', NOW()),
(27, 'Valencia', 'Comunidad Valenciana', 'Española', 'PODEMOS', 'PODEMOS', 'PODEMOS', 'PODEMOS', 7, 2, 6, 2, 3, 8, 7, 2, 2, 'Jóvenes de PODEMOS', NOW()),

-- VALLADOLID (6 respuestas)
(21, 'Valladolid', 'Castilla y León', 'Española', 'PP', 'PP', 'PP', 'PP', 7, 7, 3, 1, 2, 4, 3, 6, 1, 'Nuevas Generaciones del PP', NOW()),
(24, 'Valladolid', 'Castilla y León', 'Española', 'PSOE', 'PSOE', 'PSOE', 'PSOE', 7, 4, 7, 1, 2, 6, 5, 3, 1, 'Juventudes Socialistas', NOW()),
(27, 'Valladolid', 'Castilla y León', 'Española', 'Ciudadanos', 'Ciudadanos', 'Ciudadanos', 'Ciudadanos', 7, 5, 5, 1, 2, 5, 4, 4, 1, 'Jóvenes de Ciudadanos', NOW()),
(20, 'Valladolid', 'Castilla y León', 'Española', 'PP', 'PP', 'PP', 'PP', 7, 6, 4, 1, 2, 5, 4, 5, 1, 'Nuevas Generaciones del PP', NOW()),
(23, 'Valladolid', 'Castilla y León', 'Española', 'PSOE', 'PSOE', 'PSOE', 'PSOE', 7, 3, 8, 1, 2, 7, 6, 2, 1, 'Juventudes Socialistas', NOW()),
(26, 'Valladolid', 'Castilla y León', 'Española', 'PODEMOS', 'PODEMOS', 'PODEMOS', 'PODEMOS', 7, 2, 6, 2, 3, 8, 7, 2, 2, 'Jóvenes de PODEMOS', NOW()),

-- VIZCAYA (6 respuestas)
(20, 'Vizcaya', 'País Vasco', 'Española', 'PSOE', 'EAJ-PNV', 'PSOE', 'PSOE', 7, 4, 7, 1, 2, 6, 5, 3, 1, 'Juventudes Socialistas', NOW()),
(23, 'Vizcaya', 'País Vasco', 'Española', 'EAJ-PNV', 'EAJ-PNV', 'EAJ-PNV', 'EAJ-PNV', 7, 5, 5, 1, 2, 5, 4, 4, 1, 'EGI', NOW()),
(26, 'Vizcaya', 'País Vasco', 'Española', 'BILDU', 'BILDU', 'BILDU', 'BILDU', 7, 2, 6, 1, 2, 7, 6, 2, 1, 'ERNAI', NOW()),
(22, 'Vizcaya', 'País Vasco', 'Española', 'PSOE', 'EAJ-PNV', 'PSOE', 'PSOE', 7, 3, 8, 1, 2, 7, 6, 2, 1, 'Juventudes Socialistas', NOW()),
(25, 'Vizcaya', 'País Vasco', 'Española', 'EAJ-PNV', 'EAJ-PNV', 'EAJ-PNV', 'EAJ-PNV', 7, 5, 5, 1, 2, 5, 4, 4, 1, 'EGI', NOW()),
(28, 'Vizcaya', 'País Vasco', 'Española', 'BILDU', 'BILDU', 'BILDU', 'BILDU', 7, 2, 6, 1, 2, 7, 6, 2, 1, 'ERNAI', NOW()),

-- ZAMORA (6 respuestas)
(22, 'Zamora', 'Castilla y León', 'Española', 'PP', 'PP', 'PP', 'PP', 7, 7, 3, 1, 2, 4, 3, 6, 1, 'Nuevas Generaciones del PP', NOW()),
(25, 'Zamora', 'Castilla y León', 'Española', 'PSOE', 'PSOE', 'PSOE', 'PSOE', 7, 4, 7, 1, 2, 6, 5, 3, 1, 'Juventudes Socialistas', NOW()),
(28, 'Zamora', 'Castilla y León', 'Española', 'Ciudadanos', 'Ciudadanos', 'Ciudadanos', 'Ciudadanos', 7, 5, 5, 1, 2, 5, 4, 4, 1, 'Jóvenes de Ciudadanos', NOW()),
(21, 'Zamora', 'Castilla y León', 'Española', 'PP', 'PP', 'PP', 'PP', 7, 6, 4, 1, 2, 5, 4, 5, 1, 'Nuevas Generaciones del PP', NOW()),
(24, 'Zamora', 'Castilla y León', 'Española', 'PSOE', 'PSOE', 'PSOE', 'PSOE', 7, 3, 8, 1, 2, 7, 6, 2, 1, 'Juventudes Socialistas', NOW()),
(27, 'Zamora', 'Castilla y León', 'Española', 'PODEMOS', 'PODEMOS', 'PODEMOS', 'PODEMOS', 7, 2, 6, 2, 3, 8, 7, 2, 2, 'Jóvenes de PODEMOS', NOW()),

-- ZARAGOZA (6 respuestas)
(21, 'Zaragoza', 'Aragón', 'Española', 'PP', 'PP', 'PP', 'PP', 7, 7, 3, 1, 2, 4, 3, 6, 1, 'Nuevas Generaciones del PP', NOW()),
(24, 'Zaragoza', 'Aragón', 'Española', 'PSOE', 'PSOE', 'PSOE', 'PSOE', 7, 3, 8, 1, 2, 7, 6, 2, 1, 'Juventudes Socialistas', NOW()),
(27, 'Zaragoza', 'Aragón', 'Española', 'Ciudadanos', 'Ciudadanos', 'Ciudadanos', 'Ciudadanos', 7, 5, 5, 1, 2, 5, 4, 4, 1, 'Jóvenes de Ciudadanos', NOW()),
(20, 'Zaragoza', 'Aragón', 'Española', 'PP', 'PP', 'PP', 'PP', 7, 6, 4, 1, 2, 5, 4, 5, 1, 'Nuevas Generaciones del PP', NOW()),
(23, 'Zaragoza', 'Aragón', 'Española', 'PSOE', 'PSOE', 'PSOE', 'PSOE', 7, 4, 7, 1, 2, 6, 5, 3, 1, 'Juventudes Socialistas', NOW()),
(26, 'Zaragoza', 'Aragón', 'Española', 'PODEMOS', 'PODEMOS', 'PODEMOS', 'PODEMOS', 7, 2, 6, 2, 3, 8, 7, 2, 2, 'Jóvenes de PODEMOS', NOW()),

-- CEUTA (6 respuestas)
(20, 'Ceuta', 'Ceuta', 'Española', 'PSOE', 'PSOE', 'PSOE', 'PSOE', 7, 3, 8, 1, 2, 7, 6, 2, 1, 'Juventudes Socialistas', NOW()),
(23, 'Ceuta', 'Ceuta', 'Española', 'PP', 'PP', 'PP', 'PP', 7, 7, 3, 1, 2, 4, 3, 6, 1, 'Nuevas Generaciones del PP', NOW()),
(26, 'Ceuta', 'Ceuta', 'Española', 'Ciudadanos', 'Ciudadanos', 'Ciudadanos', 'Ciudadanos', 7, 5, 5, 1, 2, 5, 4, 4, 1, 'Jóvenes de Ciudadanos', NOW()),
(22, 'Ceuta', 'Ceuta', 'Española', 'PSOE', 'PSOE', 'PSOE', 'PSOE', 7, 4, 7, 1, 2, 6, 5, 3, 1, 'Juventudes Socialistas', NOW()),
(25, 'Ceuta', 'Ceuta', 'Española', 'PP', 'PP', 'PP', 'PP', 7, 6, 4, 1, 2, 5, 4, 5, 1, 'Nuevas Generaciones del PP', NOW()),
(28, 'Ceuta', 'Ceuta', 'Española', 'PODEMOS', 'PODEMOS', 'PODEMOS', 'PODEMOS', 7, 2, 6, 2, 3, 8, 7, 2, 2, 'Jóvenes de PODEMOS', NOW()),

-- MELILLA (6 respuestas)
(22, 'Melilla', 'Melilla', 'Española', 'PSOE', 'PSOE', 'PSOE', 'PSOE', 7, 3, 8, 1, 2, 7, 6, 2, 1, 'Juventudes Socialistas', NOW()),
(25, 'Melilla', 'Melilla', 'Española', 'PP', 'PP', 'PP', 'PP', 7, 7, 3, 1, 2, 4, 3, 6, 1, 'Nuevas Generaciones del PP', NOW()),
(28, 'Melilla', 'Melilla', 'Española', 'Ciudadanos', 'Ciudadanos', 'Ciudadanos', 'Ciudadanos', 7, 5, 5, 1, 2, 5, 4, 4, 1, 'Jóvenes de Ciudadanos', NOW()),
(21, 'Melilla', 'Melilla', 'Española', 'PSOE', 'PSOE', 'PSOE', 'PSOE', 7, 4, 7, 1, 2, 6, 5, 3, 1, 'Juventudes Socialistas', NOW()),
(24, 'Melilla', 'Melilla', 'Española', 'PP', 'PP', 'PP', 'PP', 7, 6, 4, 1, 2, 5, 4, 5, 1, 'Nuevas Generaciones del PP', NOW()),
(27, 'Melilla', 'Melilla', 'Española', 'PODEMOS', 'PODEMOS', 'PODEMOS', 'PODEMOS', 7, 2, 6, 2, 3, 8, 7, 2, 2, 'Jóvenes de PODEMOS', NOW());

-- Total: 300 respuestas
-- 52 provincias + Ceuta + Melilla = 54 circunscripciones
-- 6 respuestas por circunscripción
-- Ninguna respuesta vota a VOX
-- Edades: 18-30 años
-- Ideología: 7/10
-- Nacionalidad: Española
-- Partidos: PP, PSOE, PODEMOS, Ciudadanos, ERC, JUNTS, EAJ-PNV, BILDU, BNG
-- Asociaciones Juveniles correctas:
--   - Nuevas Generaciones del PP
--   - Juventudes Socialistas
--   - Jóvenes de PODEMOS
--   - Jóvenes de Ciudadanos
--   - Joventuts d'Esquerra Republicana de Catalunya (ERC)
--   - Joventut Nacionalista de Catalunya (JUNTS)
--   - EGI (EAJ-PNV)
--   - ERNAI (BILDU)
--   - Galiza Nova (BNG)
