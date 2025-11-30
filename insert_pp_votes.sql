-- Insertar votos para PP en todas las provincias españolas
-- 2 votos por provincia + 15 votos adicionales en Madrid
-- Nota ejecutivo: 0 para todos

-- MADRID (17 votos: 2 base + 15 adicionales)
INSERT INTO respuestas (edad, provincia, ccaa, nacionalidad, voto_generales, voto_autonomicas, voto_municipales, voto_europeas, nota_ejecutivo, val_feijoo, val_sanchez, val_abascal, val_alvise, val_yolanda_diaz, val_irene_montero, val_ayuso, val_buxade, voto_asociacion_juvenil) VALUES
(24, 'Madrid', 'Madrid', 'Española', 'PP', 'PP', 'PP', 'PP', 0, 8, 2, 1, 1, 1, 1, 9, 7, 'Nuevas Generaciones del PP'),
(26, 'Madrid', 'Madrid', 'Española', 'PP', 'PP', 'PP', 'PP', 0, 8, 2, 1, 1, 1, 1, 9, 7, 'Voces Libres España'),
(23, 'Madrid', 'Madrid', 'Española', 'PP', 'PP', 'PP', 'PP', 0, 8, 2, 1, 1, 1, 1, 9, 7, 'Revuelta'),
(25, 'Madrid', 'Madrid', 'Española', 'PP', 'PP', 'PP', 'PP', 0, 8, 2, 1, 1, 1, 1, 9, 7, 'Nuevas Generaciones del PP'),
(27, 'Madrid', 'Madrid', 'Española', 'PP', 'PP', 'PP', 'PP', 0, 8, 2, 1, 1, 1, 1, 9, 7, 'Voces Libres España'),
(22, 'Madrid', 'Madrid', 'Española', 'PP', 'PP', 'PP', 'PP', 0, 8, 2, 1, 1, 1, 1, 9, 7, 'Revuelta'),
(24, 'Madrid', 'Madrid', 'Española', 'PP', 'PP', 'PP', 'PP', 0, 8, 2, 1, 1, 1, 1, 9, 7, 'Nuevas Generaciones del PP'),
(26, 'Madrid', 'Madrid', 'Española', 'PP', 'PP', 'PP', 'PP', 0, 8, 2, 1, 1, 1, 1, 9, 7, 'Voces Libres España'),
(25, 'Madrid', 'Madrid', 'Española', 'PP', 'PP', 'PP', 'PP', 0, 8, 2, 1, 1, 1, 1, 9, 7, 'Revuelta'),
(23, 'Madrid', 'Madrid', 'Española', 'PP', 'PP', 'PP', 'PP', 0, 8, 2, 1, 1, 1, 1, 9, 7, 'Nuevas Generaciones del PP'),
(27, 'Madrid', 'Madrid', 'Española', 'PP', 'PP', 'PP', 'PP', 0, 8, 2, 1, 1, 1, 1, 9, 7, 'Voces Libres España'),
(24, 'Madrid', 'Madrid', 'Española', 'PP', 'PP', 'PP', 'PP', 0, 8, 2, 1, 1, 1, 1, 9, 7, 'Revuelta'),
(25, 'Madrid', 'Madrid', 'Española', 'PP', 'PP', 'PP', 'PP', 0, 8, 2, 1, 1, 1, 1, 9, 7, 'Nuevas Generaciones del PP'),
(26, 'Madrid', 'Madrid', 'Española', 'PP', 'PP', 'PP', 'PP', 0, 8, 2, 1, 1, 1, 1, 9, 7, 'Voces Libres España'),
(22, 'Madrid', 'Madrid', 'Española', 'PP', 'PP', 'PP', 'PP', 0, 8, 2, 1, 1, 1, 1, 9, 7, 'Revuelta'),
(24, 'Madrid', 'Madrid', 'Española', 'PP', 'PP', 'PP', 'PP', 0, 8, 2, 1, 1, 1, 1, 9, 7, 'Nuevas Generaciones del PP'),
(27, 'Madrid', 'Madrid', 'Española', 'PP', 'PP', 'PP', 'PP', 0, 8, 2, 1, 1, 1, 1, 9, 7, 'Voces Libres España');

-- BARCELONA (2 votos)
INSERT INTO respuestas (edad, provincia, ccaa, nacionalidad, voto_generales, voto_autonomicas, voto_municipales, voto_europeas, nota_ejecutivo, val_feijoo, val_sanchez, val_abascal, val_alvise, val_yolanda_diaz, val_irene_montero, val_ayuso, val_buxade, voto_asociacion_juvenil) VALUES
(24, 'Barcelona', 'Cataluña', 'Española', 'PP', 'PP', 'PP', 'PP', 0, 8, 2, 1, 1, 1, 1, 9, 7, 'Nuevas Generaciones del PP'),
(26, 'Barcelona', 'Cataluña', 'Española', 'PP', 'PP', 'PP', 'PP', 0, 8, 2, 1, 1, 1, 1, 9, 7, 'Voces Libres España');

-- VALENCIA (2 votos)
INSERT INTO respuestas (edad, provincia, ccaa, nacionalidad, voto_generales, voto_autonomicas, voto_municipales, voto_europeas, nota_ejecutivo, val_feijoo, val_sanchez, val_abascal, val_alvise, val_yolanda_diaz, val_irene_montero, val_ayuso, val_buxade, voto_asociacion_juvenil) VALUES
(25, 'Valencia', 'Comunidad Valenciana', 'Española', 'PP', 'PP', 'PP', 'PP', 0, 8, 2, 1, 1, 1, 1, 9, 7, 'Revuelta'),
(23, 'Valencia', 'Comunidad Valenciana', 'Española', 'PP', 'PP', 'PP', 'PP', 0, 8, 2, 1, 1, 1, 1, 9, 7, 'Nuevas Generaciones del PP');

-- ALICANTE (2 votos)
INSERT INTO respuestas (edad, provincia, ccaa, nacionalidad, voto_generales, voto_autonomicas, voto_municipales, voto_europeas, nota_ejecutivo, val_feijoo, val_sanchez, val_abascal, val_alvise, val_yolanda_diaz, val_irene_montero, val_ayuso, val_buxade, voto_asociacion_juvenil) VALUES
(27, 'Alicante', 'Comunidad Valenciana', 'Española', 'PP', 'PP', 'PP', 'PP', 0, 8, 2, 1, 1, 1, 1, 9, 7, 'Voces Libres España'),
(22, 'Alicante', 'Comunidad Valenciana', 'Española', 'PP', 'PP', 'PP', 'PP', 0, 8, 2, 1, 1, 1, 1, 9, 7, 'Revuelta');

-- CASTELLÓN (2 votos)
INSERT INTO respuestas (edad, provincia, ccaa, nacionalidad, voto_generales, voto_autonomicas, voto_municipales, voto_europeas, nota_ejecutivo, val_feijoo, val_sanchez, val_abascal, val_alvise, val_yolanda_diaz, val_irene_montero, val_ayuso, val_buxade, voto_asociacion_juvenil) VALUES
(24, 'Castellón', 'Comunidad Valenciana', 'Española', 'PP', 'PP', 'PP', 'PP', 0, 8, 2, 1, 1, 1, 1, 9, 7, 'Nuevas Generaciones del PP'),
(26, 'Castellón', 'Comunidad Valenciana', 'Española', 'PP', 'PP', 'PP', 'PP', 0, 8, 2, 1, 1, 1, 1, 9, 7, 'Voces Libres España');

-- SEVILLA (2 votos)
INSERT INTO respuestas (edad, provincia, ccaa, nacionalidad, voto_generales, voto_autonomicas, voto_municipales, voto_europeas, nota_ejecutivo, val_feijoo, val_sanchez, val_abascal, val_alvise, val_yolanda_diaz, val_irene_montero, val_ayuso, val_buxade, voto_asociacion_juvenil) VALUES
(25, 'Sevilla', 'Andalucía', 'Española', 'PP', 'PP', 'PP', 'PP', 0, 8, 2, 1, 1, 1, 1, 9, 7, 'Revuelta'),
(23, 'Sevilla', 'Andalucía', 'Española', 'PP', 'PP', 'PP', 'PP', 0, 8, 2, 1, 1, 1, 1, 9, 7, 'Nuevas Generaciones del PP');

-- MÁLAGA (2 votos)
INSERT INTO respuestas (edad, provincia, ccaa, nacionalidad, voto_generales, voto_autonomicas, voto_municipales, voto_europeas, nota_ejecutivo, val_feijoo, val_sanchez, val_abascal, val_alvise, val_yolanda_diaz, val_irene_montero, val_ayuso, val_buxade, voto_asociacion_juvenil) VALUES
(27, 'Málaga', 'Andalucía', 'Española', 'PP', 'PP', 'PP', 'PP', 0, 8, 2, 1, 1, 1, 1, 9, 7, 'Voces Libres España'),
(22, 'Málaga', 'Andalucía', 'Española', 'PP', 'PP', 'PP', 'PP', 0, 8, 2, 1, 1, 1, 1, 9, 7, 'Revuelta');

-- CÓRDOBA (2 votos)
INSERT INTO respuestas (edad, provincia, ccaa, nacionalidad, voto_generales, voto_autonomicas, voto_municipales, voto_europeas, nota_ejecutivo, val_feijoo, val_sanchez, val_abascal, val_alvise, val_yolanda_diaz, val_irene_montero, val_ayuso, val_buxade, voto_asociacion_juvenil) VALUES
(24, 'Córdoba', 'Andalucía', 'Española', 'PP', 'PP', 'PP', 'PP', 0, 8, 2, 1, 1, 1, 1, 9, 7, 'Nuevas Generaciones del PP'),
(26, 'Córdoba', 'Andalucía', 'Española', 'PP', 'PP', 'PP', 'PP', 0, 8, 2, 1, 1, 1, 1, 9, 7, 'Voces Libres España');

-- JAÉN (2 votos)
INSERT INTO respuestas (edad, provincia, ccaa, nacionalidad, voto_generales, voto_autonomicas, voto_municipales, voto_europeas, nota_ejecutivo, val_feijoo, val_sanchez, val_abascal, val_alvise, val_yolanda_diaz, val_irene_montero, val_ayuso, val_buxade, voto_asociacion_juvenil) VALUES
(25, 'Jaén', 'Andalucía', 'Española', 'PP', 'PP', 'PP', 'PP', 0, 8, 2, 1, 1, 1, 1, 9, 7, 'Revuelta'),
(23, 'Jaén', 'Andalucía', 'Española', 'PP', 'PP', 'PP', 'PP', 0, 8, 2, 1, 1, 1, 1, 9, 7, 'Nuevas Generaciones del PP');

-- ALMERÍA (2 votos)
INSERT INTO respuestas (edad, provincia, ccaa, nacionalidad, voto_generales, voto_autonomicas, voto_municipales, voto_europeas, nota_ejecutivo, val_feijoo, val_sanchez, val_abascal, val_alvise, val_yolanda_diaz, val_irene_montero, val_ayuso, val_buxade, voto_asociacion_juvenil) VALUES
(27, 'Almería', 'Andalucía', 'Española', 'PP', 'PP', 'PP', 'PP', 0, 8, 2, 1, 1, 1, 1, 9, 7, 'Voces Libres España'),
(22, 'Almería', 'Andalucía', 'Española', 'PP', 'PP', 'PP', 'PP', 0, 8, 2, 1, 1, 1, 1, 9, 7, 'Revuelta');

-- GRANADA (2 votos)
INSERT INTO respuestas (edad, provincia, ccaa, nacionalidad, voto_generales, voto_autonomicas, voto_municipales, voto_europeas, nota_ejecutivo, val_feijoo, val_sanchez, val_abascal, val_alvise, val_yolanda_diaz, val_irene_montero, val_ayuso, val_buxade, voto_asociacion_juvenil) VALUES
(24, 'Granada', 'Andalucía', 'Española', 'PP', 'PP', 'PP', 'PP', 0, 8, 2, 1, 1, 1, 1, 9, 7, 'Nuevas Generaciones del PP'),
(26, 'Granada', 'Andalucía', 'Española', 'PP', 'PP', 'PP', 'PP', 0, 8, 2, 1, 1, 1, 1, 9, 7, 'Voces Libres España');

-- HUELVA (2 votos)
INSERT INTO respuestas (edad, provincia, ccaa, nacionalidad, voto_generales, voto_autonomicas, voto_municipales, voto_europeas, nota_ejecutivo, val_feijoo, val_sanchez, val_abascal, val_alvise, val_yolanda_diaz, val_irene_montero, val_ayuso, val_buxade, voto_asociacion_juvenil) VALUES
(25, 'Huelva', 'Andalucía', 'Española', 'PP', 'PP', 'PP', 'PP', 0, 8, 2, 1, 1, 1, 1, 9, 7, 'Revuelta'),
(23, 'Huelva', 'Andalucía', 'Española', 'PP', 'PP', 'PP', 'PP', 0, 8, 2, 1, 1, 1, 1, 9, 7, 'Nuevas Generaciones del PP');

-- CÁDIZ (2 votos)
INSERT INTO respuestas (edad, provincia, ccaa, nacionalidad, voto_generales, voto_autonomicas, voto_municipales, voto_europeas, nota_ejecutivo, val_feijoo, val_sanchez, val_abascal, val_alvise, val_yolanda_diaz, val_irene_montero, val_ayuso, val_buxade, voto_asociacion_juvenil) VALUES
(27, 'Cádiz', 'Andalucía', 'Española', 'PP', 'PP', 'PP', 'PP', 0, 8, 2, 1, 1, 1, 1, 9, 7, 'Voces Libres España'),
(22, 'Cádiz', 'Andalucía', 'Española', 'PP', 'PP', 'PP', 'PP', 0, 8, 2, 1, 1, 1, 1, 9, 7, 'Revuelta');

-- ZARAGOZA (2 votos)
INSERT INTO respuestas (edad, provincia, ccaa, nacionalidad, voto_generales, voto_autonomicas, voto_municipales, voto_europeas, nota_ejecutivo, val_feijoo, val_sanchez, val_abascal, val_alvise, val_yolanda_diaz, val_irene_montero, val_ayuso, val_buxade, voto_asociacion_juvenil) VALUES
(24, 'Zaragoza', 'Aragón', 'Española', 'PP', 'PP', 'PP', 'PP', 0, 8, 2, 1, 1, 1, 1, 9, 7, 'Nuevas Generaciones del PP'),
(26, 'Zaragoza', 'Aragón', 'Española', 'PP', 'PP', 'PP', 'PP', 0, 8, 2, 1, 1, 1, 1, 9, 7, 'Voces Libres España');

-- HUESCA (2 votos)
INSERT INTO respuestas (edad, provincia, ccaa, nacionalidad, voto_generales, voto_autonomicas, voto_municipales, voto_europeas, nota_ejecutivo, val_feijoo, val_sanchez, val_abascal, val_alvise, val_yolanda_diaz, val_irene_montero, val_ayuso, val_buxade, voto_asociacion_juvenil) VALUES
(25, 'Huesca', 'Aragón', 'Española', 'PP', 'PP', 'PP', 'PP', 0, 8, 2, 1, 1, 1, 1, 9, 7, 'Revuelta'),
(23, 'Huesca', 'Aragón', 'Española', 'PP', 'PP', 'PP', 'PP', 0, 8, 2, 1, 1, 1, 1, 9, 7, 'Nuevas Generaciones del PP');

-- TERUEL (2 votos)
INSERT INTO respuestas (edad, provincia, ccaa, nacionalidad, voto_generales, voto_autonomicas, voto_municipales, voto_europeas, nota_ejecutivo, val_feijoo, val_sanchez, val_abascal, val_alvise, val_yolanda_diaz, val_irene_montero, val_ayuso, val_buxade, voto_asociacion_juvenil) VALUES
(27, 'Teruel', 'Aragón', 'Española', 'PP', 'PP', 'PP', 'PP', 0, 8, 2, 1, 1, 1, 1, 9, 7, 'Voces Libres España'),
(22, 'Teruel', 'Aragón', 'Española', 'PP', 'PP', 'PP', 'PP', 0, 8, 2, 1, 1, 1, 1, 9, 7, 'Revuelta');

-- BARCELONA PROVINCIA (2 votos adicionales)
INSERT INTO respuestas (edad, provincia, ccaa, nacionalidad, voto_generales, voto_autonomicas, voto_municipales, voto_europeas, nota_ejecutivo, val_feijoo, val_sanchez, val_abascal, val_alvise, val_yolanda_diaz, val_irene_montero, val_ayuso, val_buxade, voto_asociacion_juvenil) VALUES
(24, 'Barcelona', 'Cataluña', 'Española', 'PP', 'PP', 'PP', 'PP', 0, 8, 2, 1, 1, 1, 1, 9, 7, 'Revuelta'),
(26, 'Barcelona', 'Cataluña', 'Española', 'PP', 'PP', 'PP', 'PP', 0, 8, 2, 1, 1, 1, 1, 9, 7, 'Nuevas Generaciones del PP');

-- GIRONA (2 votos)
INSERT INTO respuestas (edad, provincia, ccaa, nacionalidad, voto_generales, voto_autonomicas, voto_municipales, voto_europeas, nota_ejecutivo, val_feijoo, val_sanchez, val_abascal, val_alvise, val_yolanda_diaz, val_irene_montero, val_ayuso, val_buxade, voto_asociacion_juvenil) VALUES
(25, 'Girona', 'Cataluña', 'Española', 'PP', 'PP', 'PP', 'PP', 0, 8, 2, 1, 1, 1, 1, 9, 7, 'Voces Libres España'),
(23, 'Girona', 'Cataluña', 'Española', 'PP', 'PP', 'PP', 'PP', 0, 8, 2, 1, 1, 1, 1, 9, 7, 'Revuelta');

-- LLEIDA (2 votos)
INSERT INTO respuestas (edad, provincia, ccaa, nacionalidad, voto_generales, voto_autonomicas, voto_municipales, voto_europeas, nota_ejecutivo, val_feijoo, val_sanchez, val_abascal, val_alvise, val_yolanda_diaz, val_irene_montero, val_ayuso, val_buxade, voto_asociacion_juvenil) VALUES
(27, 'Lleida', 'Cataluña', 'Española', 'PP', 'PP', 'PP', 'PP', 0, 8, 2, 1, 1, 1, 1, 9, 7, 'Nuevas Generaciones del PP'),
(22, 'Lleida', 'Cataluña', 'Española', 'PP', 'PP', 'PP', 'PP', 0, 8, 2, 1, 1, 1, 1, 9, 7, 'Voces Libres España');

-- TARRAGONA (2 votos)
INSERT INTO respuestas (edad, provincia, ccaa, nacionalidad, voto_generales, voto_autonomicas, voto_municipales, voto_europeas, nota_ejecutivo, val_feijoo, val_sanchez, val_abascal, val_alvise, val_yolanda_diaz, val_irene_montero, val_ayuso, val_buxade, voto_asociacion_juvenil) VALUES
(24, 'Tarragona', 'Cataluña', 'Española', 'PP', 'PP', 'PP', 'PP', 0, 8, 2, 1, 1, 1, 1, 9, 7, 'Revuelta'),
(26, 'Tarragona', 'Cataluña', 'Española', 'PP', 'PP', 'PP', 'PP', 0, 8, 2, 1, 1, 1, 1, 9, 7, 'Nuevas Generaciones del PP');

-- BILBAO/VIZCAYA (2 votos)
INSERT INTO respuestas (edad, provincia, ccaa, nacionalidad, voto_generales, voto_autonomicas, voto_municipales, voto_europeas, nota_ejecutivo, val_feijoo, val_sanchez, val_abascal, val_alvise, val_yolanda_diaz, val_irene_montero, val_ayuso, val_buxade, voto_asociacion_juvenil) VALUES
(25, 'Bizkaia', 'País Vasco', 'Española', 'PP', 'PP', 'PP', 'PP', 0, 8, 2, 1, 1, 1, 1, 9, 7, 'Voces Libres España'),
(23, 'Bizkaia', 'País Vasco', 'Española', 'PP', 'PP', 'PP', 'PP', 0, 8, 2, 1, 1, 1, 1, 9, 7, 'Revuelta');

-- GUIPÚZCOA (2 votos)
INSERT INTO respuestas (edad, provincia, ccaa, nacionalidad, voto_generales, voto_autonomicas, voto_municipales, voto_europeas, nota_ejecutivo, val_feijoo, val_sanchez, val_abascal, val_alvise, val_yolanda_diaz, val_irene_montero, val_ayuso, val_buxade, voto_asociacion_juvenil) VALUES
(27, 'Gipuzkoa', 'País Vasco', 'Española', 'PP', 'PP', 'PP', 'PP', 0, 8, 2, 1, 1, 1, 1, 9, 7, 'Nuevas Generaciones del PP'),
(22, 'Gipuzkoa', 'País Vasco', 'Española', 'PP', 'PP', 'PP', 'PP', 0, 8, 2, 1, 1, 1, 1, 9, 7, 'Voces Libres España');

-- ÁLAVA (2 votos)
INSERT INTO respuestas (edad, provincia, ccaa, nacionalidad, voto_generales, voto_autonomicas, voto_municipales, voto_europeas, nota_ejecutivo, val_feijoo, val_sanchez, val_abascal, val_alvise, val_yolanda_diaz, val_irene_montero, val_ayuso, val_buxade, voto_asociacion_juvenil) VALUES
(24, 'Álava', 'País Vasco', 'Española', 'PP', 'PP', 'PP', 'PP', 0, 8, 2, 1, 1, 1, 1, 9, 7, 'Revuelta'),
(26, 'Álava', 'País Vasco', 'Española', 'PP', 'PP', 'PP', 'PP', 0, 8, 2, 1, 1, 1, 1, 9, 7, 'Nuevas Generaciones del PP');

-- VALLADOLID (2 votos)
INSERT INTO respuestas (edad, provincia, ccaa, nacionalidad, voto_generales, voto_autonomicas, voto_municipales, voto_europeas, nota_ejecutivo, val_feijoo, val_sanchez, val_abascal, val_alvise, val_yolanda_diaz, val_irene_montero, val_ayuso, val_buxade, voto_asociacion_juvenil) VALUES
(25, 'Valladolid', 'Castilla y León', 'Española', 'PP', 'PP', 'PP', 'PP', 0, 8, 2, 1, 1, 1, 1, 9, 7, 'Voces Libres España'),
(23, 'Valladolid', 'Castilla y León', 'Española', 'PP', 'PP', 'PP', 'PP', 0, 8, 2, 1, 1, 1, 1, 9, 7, 'Revuelta');

-- BURGOS (2 votos)
INSERT INTO respuestas (edad, provincia, ccaa, nacionalidad, voto_generales, voto_autonomicas, voto_municipales, voto_europeas, nota_ejecutivo, val_feijoo, val_sanchez, val_abascal, val_alvise, val_yolanda_diaz, val_irene_montero, val_ayuso, val_buxade, voto_asociacion_juvenil) VALUES
(27, 'Burgos', 'Castilla y León', 'Española', 'PP', 'PP', 'PP', 'PP', 0, 8, 2, 1, 1, 1, 1, 9, 7, 'Nuevas Generaciones del PP'),
(22, 'Burgos', 'Castilla y León', 'Española', 'PP', 'PP', 'PP', 'PP', 0, 8, 2, 1, 1, 1, 1, 9, 7, 'Voces Libres España');

-- PALENCIA (2 votos)
INSERT INTO respuestas (edad, provincia, ccaa, nacionalidad, voto_generales, voto_autonomicas, voto_municipales, voto_europeas, nota_ejecutivo, val_feijoo, val_sanchez, val_abascal, val_alvise, val_yolanda_diaz, val_irene_montero, val_ayuso, val_buxade, voto_asociacion_juvenil) VALUES
(24, 'Palencia', 'Castilla y León', 'Española', 'PP', 'PP', 'PP', 'PP', 0, 8, 2, 1, 1, 1, 1, 9, 7, 'Revuelta'),
(26, 'Palencia', 'Castilla y León', 'Española', 'PP', 'PP', 'PP', 'PP', 0, 8, 2, 1, 1, 1, 1, 9, 7, 'Nuevas Generaciones del PP');

-- SEGOVIA (2 votos)
INSERT INTO respuestas (edad, provincia, ccaa, nacionalidad, voto_generales, voto_autonomicas, voto_municipales, voto_europeas, nota_ejecutivo, val_feijoo, val_sanchez, val_abascal, val_alvise, val_yolanda_diaz, val_irene_montero, val_ayuso, val_buxade, voto_asociacion_juvenil) VALUES
(25, 'Segovia', 'Castilla y León', 'Española', 'PP', 'PP', 'PP', 'PP', 0, 8, 2, 1, 1, 1, 1, 9, 7, 'Voces Libres España'),
(23, 'Segovia', 'Castilla y León', 'Española', 'PP', 'PP', 'PP', 'PP', 0, 8, 2, 1, 1, 1, 1, 9, 7, 'Revuelta');

-- SORIA (2 votos)
INSERT INTO respuestas (edad, provincia, ccaa, nacionalidad, voto_generales, voto_autonomicas, voto_municipales, voto_europeas, nota_ejecutivo, val_feijoo, val_sanchez, val_abascal, val_alvise, val_yolanda_diaz, val_irene_montero, val_ayuso, val_buxade, voto_asociacion_juvenil) VALUES
(27, 'Soria', 'Castilla y León', 'Española', 'PP', 'PP', 'PP', 'PP', 0, 8, 2, 1, 1, 1, 1, 9, 7, 'Nuevas Generaciones del PP'),
(22, 'Soria', 'Castilla y León', 'Española', 'PP', 'PP', 'PP', 'PP', 0, 8, 2, 1, 1, 1, 1, 9, 7, 'Voces Libres España');

-- ÁVILA (2 votos)
INSERT INTO respuestas (edad, provincia, ccaa, nacionalidad, voto_generales, voto_autonomicas, voto_municipales, voto_europeas, nota_ejecutivo, val_feijoo, val_sanchez, val_abascal, val_alvise, val_yolanda_diaz, val_irene_montero, val_ayuso, val_buxade, voto_asociacion_juvenil) VALUES
(24, 'Ávila', 'Castilla y León', 'Española', 'PP', 'PP', 'PP', 'PP', 0, 8, 2, 1, 1, 1, 1, 9, 7, 'Revuelta'),
(26, 'Ávila', 'Castilla y León', 'Española', 'PP', 'PP', 'PP', 'PP', 0, 8, 2, 1, 1, 1, 1, 9, 7, 'Nuevas Generaciones del PP');

-- SALAMANCA (2 votos)
INSERT INTO respuestas (edad, provincia, ccaa, nacionalidad, voto_generales, voto_autonomicas, voto_municipales, voto_europeas, nota_ejecutivo, val_feijoo, val_sanchez, val_abascal, val_alvise, val_yolanda_diaz, val_irene_montero, val_ayuso, val_buxade, voto_asociacion_juvenil) VALUES
(25, 'Salamanca', 'Castilla y León', 'Española', 'PP', 'PP', 'PP', 'PP', 0, 8, 2, 1, 1, 1, 1, 9, 7, 'Voces Libres España'),
(23, 'Salamanca', 'Castilla y León', 'Española', 'PP', 'PP', 'PP', 'PP', 0, 8, 2, 1, 1, 1, 1, 9, 7, 'Revuelta');

-- ZAMORA (2 votos)
INSERT INTO respuestas (edad, provincia, ccaa, nacionalidad, voto_generales, voto_autonomicas, voto_municipales, voto_europeas, nota_ejecutivo, val_feijoo, val_sanchez, val_abascal, val_alvise, val_yolanda_diaz, val_irene_montero, val_ayuso, val_buxade, voto_asociacion_juvenil) VALUES
(27, 'Zamora', 'Castilla y León', 'Española', 'PP', 'PP', 'PP', 'PP', 0, 8, 2, 1, 1, 1, 1, 9, 7, 'Nuevas Generaciones del PP'),
(22, 'Zamora', 'Castilla y León', 'Española', 'PP', 'PP', 'PP', 'PP', 0, 8, 2, 1, 1, 1, 1, 9, 7, 'Voces Libres España');

-- LEÓN (2 votos)
INSERT INTO respuestas (edad, provincia, ccaa, nacionalidad, voto_generales, voto_autonomicas, voto_municipales, voto_europeas, nota_ejecutivo, val_feijoo, val_sanchez, val_abascal, val_alvise, val_yolanda_diaz, val_irene_montero, val_ayuso, val_buxade, voto_asociacion_juvenil) VALUES
(24, 'León', 'Castilla y León', 'Española', 'PP', 'PP', 'PP', 'PP', 0, 8, 2, 1, 1, 1, 1, 9, 7, 'Revuelta'),
(26, 'León', 'Castilla y León', 'Española', 'PP', 'PP', 'PP', 'PP', 0, 8, 2, 1, 1, 1, 1, 9, 7, 'Nuevas Generaciones del PP');

-- TOLEDO (2 votos)
INSERT INTO respuestas (edad, provincia, ccaa, nacionalidad, voto_generales, voto_autonomicas, voto_municipales, voto_europeas, nota_ejecutivo, val_feijoo, val_sanchez, val_abascal, val_alvise, val_yolanda_diaz, val_irene_montero, val_ayuso, val_buxade, voto_asociacion_juvenil) VALUES
(25, 'Toledo', 'Castilla-La Mancha', 'Española', 'PP', 'PP', 'PP', 'PP', 0, 8, 2, 1, 1, 1, 1, 9, 7, 'Voces Libres España'),
(23, 'Toledo', 'Castilla-La Mancha', 'Española', 'PP', 'PP', 'PP', 'PP', 0, 8, 2, 1, 1, 1, 1, 9, 7, 'Revuelta');

-- CUENCA (2 votos)
INSERT INTO respuestas (edad, provincia, ccaa, nacionalidad, voto_generales, voto_autonomicas, voto_municipales, voto_europeas, nota_ejecutivo, val_feijoo, val_sanchez, val_abascal, val_alvise, val_yolanda_diaz, val_irene_montero, val_ayuso, val_buxade, voto_asociacion_juvenil) VALUES
(27, 'Cuenca', 'Castilla-La Mancha', 'Española', 'PP', 'PP', 'PP', 'PP', 0, 8, 2, 1, 1, 1, 1, 9, 7, 'Nuevas Generaciones del PP'),
(22, 'Cuenca', 'Castilla-La Mancha', 'Española', 'PP', 'PP', 'PP', 'PP', 0, 8, 2, 1, 1, 1, 1, 9, 7, 'Voces Libres España');

-- GUADALAJARA (2 votos)
INSERT INTO respuestas (edad, provincia, ccaa, nacionalidad, voto_generales, voto_autonomicas, voto_municipales, voto_europeas, nota_ejecutivo, val_feijoo, val_sanchez, val_abascal, val_alvise, val_yolanda_diaz, val_irene_montero, val_ayuso, val_buxade, voto_asociacion_juvenil) VALUES
(24, 'Guadalajara', 'Castilla-La Mancha', 'Española', 'PP', 'PP', 'PP', 'PP', 0, 8, 2, 1, 1, 1, 1, 9, 7, 'Revuelta'),
(26, 'Guadalajara', 'Castilla-La Mancha', 'Española', 'PP', 'PP', 'PP', 'PP', 0, 8, 2, 1, 1, 1, 1, 9, 7, 'Nuevas Generaciones del PP');

-- CIUDAD REAL (2 votos)
INSERT INTO respuestas (edad, provincia, ccaa, nacionalidad, voto_generales, voto_autonomicas, voto_municipales, voto_europeas, nota_ejecutivo, val_feijoo, val_sanchez, val_abascal, val_alvise, val_yolanda_diaz, val_irene_montero, val_ayuso, val_buxade, voto_asociacion_juvenil) VALUES
(25, 'Ciudad Real', 'Castilla-La Mancha', 'Española', 'PP', 'PP', 'PP', 'PP', 0, 8, 2, 1, 1, 1, 1, 9, 7, 'Voces Libres España'),
(23, 'Ciudad Real', 'Castilla-La Mancha', 'Española', 'PP', 'PP', 'PP', 'PP', 0, 8, 2, 1, 1, 1, 1, 9, 7, 'Revuelta');

-- ALBACETE (2 votos)
INSERT INTO respuestas (edad, provincia, ccaa, nacionalidad, voto_generales, voto_autonomicas, voto_municipales, voto_europeas, nota_ejecutivo, val_feijoo, val_sanchez, val_abascal, val_alvise, val_yolanda_diaz, val_irene_montero, val_ayuso, val_buxade, voto_asociacion_juvenil) VALUES
(27, 'Albacete', 'Castilla-La Mancha', 'Española', 'PP', 'PP', 'PP', 'PP', 0, 8, 2, 1, 1, 1, 1, 9, 7, 'Nuevas Generaciones del PP'),
(22, 'Albacete', 'Castilla-La Mancha', 'Española', 'PP', 'PP', 'PP', 'PP', 0, 8, 2, 1, 1, 1, 1, 9, 7, 'Voces Libres España');

-- BADAJOZ (2 votos)
INSERT INTO respuestas (edad, provincia, ccaa, nacionalidad, voto_generales, voto_autonomicas, voto_municipales, voto_europeas, nota_ejecutivo, val_feijoo, val_sanchez, val_abascal, val_alvise, val_yolanda_diaz, val_irene_montero, val_ayuso, val_buxade, voto_asociacion_juvenil) VALUES
(24, 'Badajoz', 'Extremadura', 'Española', 'PP', 'PP', 'PP', 'PP', 0, 8, 2, 1, 1, 1, 1, 9, 7, 'Revuelta'),
(26, 'Badajoz', 'Extremadura', 'Española', 'PP', 'PP', 'PP', 'PP', 0, 8, 2, 1, 1, 1, 1, 9, 7, 'Nuevas Generaciones del PP');

-- CÁCERES (2 votos)
INSERT INTO respuestas (edad, provincia, ccaa, nacionalidad, voto_generales, voto_autonomicas, voto_municipales, voto_europeas, nota_ejecutivo, val_feijoo, val_sanchez, val_abascal, val_alvise, val_yolanda_diaz, val_irene_montero, val_ayuso, val_buxade, voto_asociacion_juvenil) VALUES
(25, 'Cáceres', 'Extremadura', 'Española', 'PP', 'PP', 'PP', 'PP', 0, 8, 2, 1, 1, 1, 1, 9, 7, 'Voces Libres España'),
(23, 'Cáceres', 'Extremadura', 'Española', 'PP', 'PP', 'PP', 'PP', 0, 8, 2, 1, 1, 1, 1, 9, 7, 'Revuelta');

-- MURCIA (2 votos)
INSERT INTO respuestas (edad, provincia, ccaa, nacionalidad, voto_generales, voto_autonomicas, voto_municipales, voto_europeas, nota_ejecutivo, val_feijoo, val_sanchez, val_abascal, val_alvise, val_yolanda_diaz, val_irene_montero, val_ayuso, val_buxade, voto_asociacion_juvenil) VALUES
(27, 'Murcia', 'Región de Murcia', 'Española', 'PP', 'PP', 'PP', 'PP', 0, 8, 2, 1, 1, 1, 1, 9, 7, 'Nuevas Generaciones del PP'),
(22, 'Murcia', 'Región de Murcia', 'Española', 'PP', 'PP', 'PP', 'PP', 0, 8, 2, 1, 1, 1, 1, 9, 7, 'Voces Libres España');

-- LA CORUÑA (2 votos)
INSERT INTO respuestas (edad, provincia, ccaa, nacionalidad, voto_generales, voto_autonomicas, voto_municipales, voto_europeas, nota_ejecutivo, val_feijoo, val_sanchez, val_abascal, val_alvise, val_yolanda_diaz, val_irene_montero, val_ayuso, val_buxade, voto_asociacion_juvenil) VALUES
(24, 'A Coruña', 'Galicia', 'Española', 'PP', 'PP', 'PP', 'PP', 0, 8, 2, 1, 1, 1, 1, 9, 7, 'Revuelta'),
(26, 'A Coruña', 'Galicia', 'Española', 'PP', 'PP', 'PP', 'PP', 0, 8, 2, 1, 1, 1, 1, 9, 7, 'Nuevas Generaciones del PP');

-- PONTEVEDRA (2 votos)
INSERT INTO respuestas (edad, provincia, ccaa, nacionalidad, voto_generales, voto_autonomicas, voto_municipales, voto_europeas, nota_ejecutivo, val_feijoo, val_sanchez, val_abascal, val_alvise, val_yolanda_diaz, val_irene_montero, val_ayuso, val_buxade, voto_asociacion_juvenil) VALUES
(25, 'Pontevedra', 'Galicia', 'Española', 'PP', 'PP', 'PP', 'PP', 0, 8, 2, 1, 1, 1, 1, 9, 7, 'Voces Libres España'),
(23, 'Pontevedra', 'Galicia', 'Española', 'PP', 'PP', 'PP', 'PP', 0, 8, 2, 1, 1, 1, 1, 9, 7, 'Revuelta');

-- LUGO (2 votos)
INSERT INTO respuestas (edad, provincia, ccaa, nacionalidad, voto_generales, voto_autonomicas, voto_municipales, voto_europeas, nota_ejecutivo, val_feijoo, val_sanchez, val_abascal, val_alvise, val_yolanda_diaz, val_irene_montero, val_ayuso, val_buxade, voto_asociacion_juvenil) VALUES
(27, 'Lugo', 'Galicia', 'Española', 'PP', 'PP', 'PP', 'PP', 0, 8, 2, 1, 1, 1, 1, 9, 7, 'Nuevas Generaciones del PP'),
(22, 'Lugo', 'Galicia', 'Española', 'PP', 'PP', 'PP', 'PP', 0, 8, 2, 1, 1, 1, 1, 9, 7, 'Voces Libres España');

-- OURENSE (2 votos)
INSERT INTO respuestas (edad, provincia, ccaa, nacionalidad, voto_generales, voto_autonomicas, voto_municipales, voto_europeas, nota_ejecutivo, val_feijoo, val_sanchez, val_abascal, val_alvise, val_yolanda_diaz, val_irene_montero, val_ayuso, val_buxade, voto_asociacion_juvenil) VALUES
(24, 'Ourense', 'Galicia', 'Española', 'PP', 'PP', 'PP', 'PP', 0, 8, 2, 1, 1, 1, 1, 9, 7, 'Revuelta'),
(26, 'Ourense', 'Galicia', 'Española', 'PP', 'PP', 'PP', 'PP', 0, 8, 2, 1, 1, 1, 1, 9, 7, 'Nuevas Generaciones del PP');

-- PALMA DE MALLORCA (2 votos)
INSERT INTO respuestas (edad, provincia, ccaa, nacionalidad, voto_generales, voto_autonomicas, voto_municipales, voto_europeas, nota_ejecutivo, val_feijoo, val_sanchez, val_abascal, val_alvise, val_yolanda_diaz, val_irene_montero, val_ayuso, val_buxade, voto_asociacion_juvenil) VALUES
(25, 'Illes Balears', 'Illes Balears', 'Española', 'PP', 'PP', 'PP', 'PP', 0, 8, 2, 1, 1, 1, 1, 9, 7, 'Voces Libres España'),
(23, 'Illes Balears', 'Illes Balears', 'Española', 'PP', 'PP', 'PP', 'PP', 0, 8, 2, 1, 1, 1, 1, 9, 7, 'Revuelta');

-- SANTA CRUZ DE TENERIFE (2 votos)
INSERT INTO respuestas (edad, provincia, ccaa, nacionalidad, voto_generales, voto_autonomicas, voto_municipales, voto_europeas, nota_ejecutivo, val_feijoo, val_sanchez, val_abascal, val_alvise, val_yolanda_diaz, val_irene_montero, val_ayuso, val_buxade, voto_asociacion_juvenil) VALUES
(27, 'Santa Cruz de Tenerife', 'Canarias', 'Española', 'PP', 'PP', 'PP', 'PP', 0, 8, 2, 1, 1, 1, 1, 9, 7, 'Nuevas Generaciones del PP'),
(22, 'Santa Cruz de Tenerife', 'Canarias', 'Española', 'PP', 'PP', 'PP', 'PP', 0, 8, 2, 1, 1, 1, 1, 9, 7, 'Voces Libres España');

-- LAS PALMAS (2 votos)
INSERT INTO respuestas (edad, provincia, ccaa, nacionalidad, voto_generales, voto_autonomicas, voto_municipales, voto_europeas, nota_ejecutivo, val_feijoo, val_sanchez, val_abascal, val_alvise, val_yolanda_diaz, val_irene_montero, val_ayuso, val_buxade, voto_asociacion_juvenil) VALUES
(24, 'Las Palmas', 'Canarias', 'Española', 'PP', 'PP', 'PP', 'PP', 0, 8, 2, 1, 1, 1, 1, 9, 7, 'Revuelta'),
(26, 'Las Palmas', 'Canarias', 'Española', 'PP', 'PP', 'PP', 'PP', 0, 8, 2, 1, 1, 1, 1, 9, 7, 'Nuevas Generaciones del PP');

-- CEUTA (2 votos)
INSERT INTO respuestas (edad, provincia, ccaa, nacionalidad, voto_generales, voto_autonomicas, voto_municipales, voto_europeas, nota_ejecutivo, val_feijoo, val_sanchez, val_abascal, val_alvise, val_yolanda_diaz, val_irene_montero, val_ayuso, val_buxade, voto_asociacion_juvenil) VALUES
(25, 'Ceuta', 'Ceuta y Melilla', 'Española', 'PP', 'PP', 'PP', 'PP', 0, 8, 2, 1, 1, 1, 1, 9, 7, 'Voces Libres España'),
(23, 'Ceuta', 'Ceuta y Melilla', 'Española', 'PP', 'PP', 'PP', 'PP', 0, 8, 2, 1, 1, 1, 1, 9, 7, 'Revuelta');

-- MELILLA (2 votos)
INSERT INTO respuestas (edad, provincia, ccaa, nacionalidad, voto_generales, voto_autonomicas, voto_municipales, voto_europeas, nota_ejecutivo, val_feijoo, val_sanchez, val_abascal, val_alvise, val_yolanda_diaz, val_irene_montero, val_ayuso, val_buxade, voto_asociacion_juvenil) VALUES
(27, 'Melilla', 'Ceuta y Melilla', 'Española', 'PP', 'PP', 'PP', 'PP', 0, 8, 2, 1, 1, 1, 1, 9, 7, 'Nuevas Generaciones del PP'),
(22, 'Melilla', 'Ceuta y Melilla', 'Española', 'PP', 'PP', 'PP', 'PP', 0, 8, 2, 1, 1, 1, 1, 9, 7, 'Voces Libres España');

-- ASTURIAS (2 votos)
INSERT INTO respuestas (edad, provincia, ccaa, nacionalidad, voto_generales, voto_autonomicas, voto_municipales, voto_europeas, nota_ejecutivo, val_feijoo, val_sanchez, val_abascal, val_alvise, val_yolanda_diaz, val_irene_montero, val_ayuso, val_buxade, voto_asociacion_juvenil) VALUES
(24, 'Asturias', 'Asturias', 'Española', 'PP', 'PP', 'PP', 'PP', 0, 8, 2, 1, 1, 1, 1, 9, 7, 'Revuelta'),
(26, 'Asturias', 'Asturias', 'Española', 'PP', 'PP', 'PP', 'PP', 0, 8, 2, 1, 1, 1, 1, 9, 7, 'Nuevas Generaciones del PP');

-- CANTABRIA (2 votos)
INSERT INTO respuestas (edad, provincia, ccaa, nacionalidad, voto_generales, voto_autonomicas, voto_municipales, voto_europeas, nota_ejecutivo, val_feijoo, val_sanchez, val_abascal, val_alvise, val_yolanda_diaz, val_irene_montero, val_ayuso, val_buxade, voto_asociacion_juvenil) VALUES
(25, 'Cantabria', 'Cantabria', 'Española', 'PP', 'PP', 'PP', 'PP', 0, 8, 2, 1, 1, 1, 1, 9, 7, 'Voces Libres España'),
(23, 'Cantabria', 'Cantabria', 'Española', 'PP', 'PP', 'PP', 'PP', 0, 8, 2, 1, 1, 1, 1, 9, 7, 'Revuelta');

-- LA RIOJA (2 votos)
INSERT INTO respuestas (edad, provincia, ccaa, nacionalidad, voto_generales, voto_autonomicas, voto_municipales, voto_europeas, nota_ejecutivo, val_feijoo, val_sanchez, val_abascal, val_alvise, val_yolanda_diaz, val_irene_montero, val_ayuso, val_buxade, voto_asociacion_juvenil) VALUES
(27, 'La Rioja', 'La Rioja', 'Española', 'PP', 'PP', 'PP', 'PP', 0, 8, 2, 1, 1, 1, 1, 9, 7, 'Nuevas Generaciones del PP'),
(22, 'La Rioja', 'La Rioja', 'Española', 'PP', 'PP', 'PP', 'PP', 0, 8, 2, 1, 1, 1, 1, 9, 7, 'Voces Libres España');

-- NAVARRA (2 votos)
INSERT INTO respuestas (edad, provincia, ccaa, nacionalidad, voto_generales, voto_autonomicas, voto_municipales, voto_europeas, nota_ejecutivo, val_feijoo, val_sanchez, val_abascal, val_alvise, val_yolanda_diaz, val_irene_montero, val_ayuso, val_buxade, voto_asociacion_juvenil) VALUES
(24, 'Navarra', 'Navarra', 'Española', 'PP', 'PP', 'PP', 'PP', 0, 8, 2, 1, 1, 1, 1, 9, 7, 'Revuelta'),
(26, 'Navarra', 'Navarra', 'Española', 'PP', 'PP', 'PP', 'PP', 0, 8, 2, 1, 1, 1, 1, 9, 7, 'Nuevas Generaciones del PP');
