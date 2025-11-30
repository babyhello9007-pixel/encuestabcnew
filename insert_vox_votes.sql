-- Insertar votos para VOX en todas las provincias españolas
-- 1 voto por provincia + 8 votos en Madrid
-- Nota ejecutivo: 0 para todos
-- Abascal: 9, Ayuso: 9, Feijóo: 3, Sánchez: 0, Yolanda Díaz: 0, Irene Montero: 0, Álvise: 4, Buxadé: 4-8 alternado

-- MADRID (8 votos)
INSERT INTO respuestas (edad, provincia, ccaa, nacionalidad, voto_generales, voto_autonomicas, voto_municipales, voto_europeas, nota_ejecutivo, val_feijoo, val_sanchez, val_abascal, val_alvise, val_yolanda_diaz, val_irene_montero, val_ayuso, val_buxade, voto_asociacion_juvenil) VALUES
(28, 'Madrid', 'Madrid', 'Española', 'VOX', 'VOX', 'VOX', 'VOX', 0, 3, 0, 9, 4, 0, 0, 9, 4, 'Jóvenes de Vox'),
(26, 'Madrid', 'Madrid', 'Española', 'VOX', 'VOX', 'VOX', 'VOX', 0, 3, 0, 9, 4, 0, 0, 9, 8, 'Revuelta'),
(31, 'Madrid', 'Madrid', 'Española', 'VOX', 'VOX', 'VOX', 'VOX', 0, 3, 0, 9, 4, 0, 0, 9, 4, 'Jóvenes de Vox'),
(24, 'Madrid', 'Madrid', 'Española', 'VOX', 'VOX', 'VOX', 'VOX', 0, 3, 0, 9, 4, 0, 0, 9, 8, 'Revuelta'),
(29, 'Madrid', 'Madrid', 'Española', 'VOX', 'VOX', 'VOX', 'VOX', 0, 3, 0, 9, 4, 0, 0, 9, 4, 'Jóvenes de Vox'),
(27, 'Madrid', 'Madrid', 'Española', 'VOX', 'VOX', 'VOX', 'VOX', 0, 3, 0, 9, 4, 0, 0, 9, 8, 'Revuelta'),
(25, 'Madrid', 'Madrid', 'Española', 'VOX', 'VOX', 'VOX', 'VOX', 0, 3, 0, 9, 4, 0, 0, 9, 4, 'Jóvenes de Vox'),
(30, 'Madrid', 'Madrid', 'Española', 'VOX', 'VOX', 'VOX', 'VOX', 0, 3, 0, 9, 4, 0, 0, 9, 8, 'Revuelta');

-- BARCELONA (1 voto)
INSERT INTO respuestas (edad, provincia, ccaa, nacionalidad, voto_generales, voto_autonomicas, voto_municipales, voto_europeas, nota_ejecutivo, val_feijoo, val_sanchez, val_abascal, val_alvise, val_yolanda_diaz, val_irene_montero, val_ayuso, val_buxade, voto_asociacion_juvenil) VALUES
(28, 'Barcelona', 'Cataluña', 'Española', 'VOX', 'VOX', 'VOX', 'VOX', 0, 3, 0, 9, 4, 0, 0, 9, 4, 'Jóvenes de Vox');

-- VALENCIA (1 voto)
INSERT INTO respuestas (edad, provincia, ccaa, nacionalidad, voto_generales, voto_autonomicas, voto_municipales, voto_europeas, nota_ejecutivo, val_feijoo, val_sanchez, val_abascal, val_alvise, val_yolanda_diaz, val_irene_montero, val_ayuso, val_buxade, voto_asociacion_juvenil) VALUES
(26, 'Valencia', 'Comunidad Valenciana', 'Española', 'VOX', 'VOX', 'VOX', 'VOX', 0, 3, 0, 9, 4, 0, 0, 9, 8, 'Revuelta');

-- ALICANTE (1 voto)
INSERT INTO respuestas (edad, provincia, ccaa, nacionalidad, voto_generales, voto_autonomicas, voto_municipales, voto_europeas, nota_ejecutivo, val_feijoo, val_sanchez, val_abascal, val_alvise, val_yolanda_diaz, val_irene_montero, val_ayuso, val_buxade, voto_asociacion_juvenil) VALUES
(31, 'Alicante', 'Comunidad Valenciana', 'Española', 'VOX', 'VOX', 'VOX', 'VOX', 0, 3, 0, 9, 4, 0, 0, 9, 4, 'Jóvenes de Vox');

-- CASTELLÓN (1 voto)
INSERT INTO respuestas (edad, provincia, ccaa, nacionalidad, voto_generales, voto_autonomicas, voto_municipales, voto_europeas, nota_ejecutivo, val_feijoo, val_sanchez, val_abascal, val_alvise, val_yolanda_diaz, val_irene_montero, val_ayuso, val_buxade, voto_asociacion_juvenil) VALUES
(24, 'Castellón', 'Comunidad Valenciana', 'Española', 'VOX', 'VOX', 'VOX', 'VOX', 0, 3, 0, 9, 4, 0, 0, 9, 8, 'Revuelta');

-- SEVILLA (1 voto)
INSERT INTO respuestas (edad, provincia, ccaa, nacionalidad, voto_generales, voto_autonomicas, voto_municipales, voto_europeas, nota_ejecutivo, val_feijoo, val_sanchez, val_abascal, val_alvise, val_yolanda_diaz, val_irene_montero, val_ayuso, val_buxade, voto_asociacion_juvenil) VALUES
(29, 'Sevilla', 'Andalucía', 'Española', 'VOX', 'VOX', 'VOX', 'VOX', 0, 3, 0, 9, 4, 0, 0, 9, 4, 'Jóvenes de Vox');

-- MÁLAGA (1 voto)
INSERT INTO respuestas (edad, provincia, ccaa, nacionalidad, voto_generales, voto_autonomicas, voto_municipales, voto_europeas, nota_ejecutivo, val_feijoo, val_sanchez, val_abascal, val_alvise, val_yolanda_diaz, val_irene_montero, val_ayuso, val_buxade, voto_asociacion_juvenil) VALUES
(27, 'Málaga', 'Andalucía', 'Española', 'VOX', 'VOX', 'VOX', 'VOX', 0, 3, 0, 9, 4, 0, 0, 9, 8, 'Revuelta');

-- CÓRDOBA (1 voto)
INSERT INTO respuestas (edad, provincia, ccaa, nacionalidad, voto_generales, voto_autonomicas, voto_municipales, voto_europeas, nota_ejecutivo, val_feijoo, val_sanchez, val_abascal, val_alvise, val_yolanda_diaz, val_irene_montero, val_ayuso, val_buxade, voto_asociacion_juvenil) VALUES
(25, 'Córdoba', 'Andalucía', 'Española', 'VOX', 'VOX', 'VOX', 'VOX', 0, 3, 0, 9, 4, 0, 0, 9, 4, 'Jóvenes de Vox');

-- JAÉN (1 voto)
INSERT INTO respuestas (edad, provincia, ccaa, nacionalidad, voto_generales, voto_autonomicas, voto_municipales, voto_europeas, nota_ejecutivo, val_feijoo, val_sanchez, val_abascal, val_alvise, val_yolanda_diaz, val_irene_montero, val_ayuso, val_buxade, voto_asociacion_juvenil) VALUES
(30, 'Jaén', 'Andalucía', 'Española', 'VOX', 'VOX', 'VOX', 'VOX', 0, 3, 0, 9, 4, 0, 0, 9, 8, 'Revuelta');

-- ALMERÍA (1 voto)
INSERT INTO respuestas (edad, provincia, ccaa, nacionalidad, voto_generales, voto_autonomicas, voto_municipales, voto_europeas, nota_ejecutivo, val_feijoo, val_sanchez, val_abascal, val_alvise, val_yolanda_diaz, val_irene_montero, val_ayuso, val_buxade, voto_asociacion_juvenil) VALUES
(28, 'Almería', 'Andalucía', 'Española', 'VOX', 'VOX', 'VOX', 'VOX', 0, 3, 0, 9, 4, 0, 0, 9, 4, 'Jóvenes de Vox');

-- GRANADA (1 voto)
INSERT INTO respuestas (edad, provincia, ccaa, nacionalidad, voto_generales, voto_autonomicas, voto_municipales, voto_europeas, nota_ejecutivo, val_feijoo, val_sanchez, val_abascal, val_alvise, val_yolanda_diaz, val_irene_montero, val_ayuso, val_buxade, voto_asociacion_juvenil) VALUES
(26, 'Granada', 'Andalucía', 'Española', 'VOX', 'VOX', 'VOX', 'VOX', 0, 3, 0, 9, 4, 0, 0, 9, 8, 'Revuelta');

-- HUELVA (1 voto)
INSERT INTO respuestas (edad, provincia, ccaa, nacionalidad, voto_generales, voto_autonomicas, voto_municipales, voto_europeas, nota_ejecutivo, val_feijoo, val_sanchez, val_abascal, val_alvise, val_yolanda_diaz, val_irene_montero, val_ayuso, val_buxade, voto_asociacion_juvenil) VALUES
(31, 'Huelva', 'Andalucía', 'Española', 'VOX', 'VOX', 'VOX', 'VOX', 0, 3, 0, 9, 4, 0, 0, 9, 4, 'Jóvenes de Vox');

-- CÁDIZ (1 voto)
INSERT INTO respuestas (edad, provincia, ccaa, nacionalidad, voto_generales, voto_autonomicas, voto_municipales, voto_europeas, nota_ejecutivo, val_feijoo, val_sanchez, val_abascal, val_alvise, val_yolanda_diaz, val_irene_montero, val_ayuso, val_buxade, voto_asociacion_juvenil) VALUES
(24, 'Cádiz', 'Andalucía', 'Española', 'VOX', 'VOX', 'VOX', 'VOX', 0, 3, 0, 9, 4, 0, 0, 9, 8, 'Revuelta');

-- ZARAGOZA (1 voto)
INSERT INTO respuestas (edad, provincia, ccaa, nacionalidad, voto_generales, voto_autonomicas, voto_municipales, voto_europeas, nota_ejecutivo, val_feijoo, val_sanchez, val_abascal, val_alvise, val_yolanda_diaz, val_irene_montero, val_ayuso, val_buxade, voto_asociacion_juvenil) VALUES
(29, 'Zaragoza', 'Aragón', 'Española', 'VOX', 'VOX', 'VOX', 'VOX', 0, 3, 0, 9, 4, 0, 0, 9, 4, 'Jóvenes de Vox');

-- HUESCA (1 voto)
INSERT INTO respuestas (edad, provincia, ccaa, nacionalidad, voto_generales, voto_autonomicas, voto_municipales, voto_europeas, nota_ejecutivo, val_feijoo, val_sanchez, val_abascal, val_alvise, val_yolanda_diaz, val_irene_montero, val_ayuso, val_buxade, voto_asociacion_juvenil) VALUES
(27, 'Huesca', 'Aragón', 'Española', 'VOX', 'VOX', 'VOX', 'VOX', 0, 3, 0, 9, 4, 0, 0, 9, 8, 'Revuelta');

-- TERUEL (1 voto)
INSERT INTO respuestas (edad, provincia, ccaa, nacionalidad, voto_generales, voto_autonomicas, voto_municipales, voto_europeas, nota_ejecutivo, val_feijoo, val_sanchez, val_abascal, val_alvise, val_yolanda_diaz, val_irene_montero, val_ayuso, val_buxade, voto_asociacion_juvenil) VALUES
(25, 'Teruel', 'Aragón', 'Española', 'VOX', 'VOX', 'VOX', 'VOX', 0, 3, 0, 9, 4, 0, 0, 9, 4, 'Jóvenes de Vox');

-- GIRONA (1 voto)
INSERT INTO respuestas (edad, provincia, ccaa, nacionalidad, voto_generales, voto_autonomicas, voto_municipales, voto_europeas, nota_ejecutivo, val_feijoo, val_sanchez, val_abascal, val_alvise, val_yolanda_diaz, val_irene_montero, val_ayuso, val_buxade, voto_asociacion_juvenil) VALUES
(30, 'Girona', 'Cataluña', 'Española', 'VOX', 'VOX', 'VOX', 'VOX', 0, 3, 0, 9, 4, 0, 0, 9, 8, 'Revuelta');

-- LLEIDA (1 voto)
INSERT INTO respuestas (edad, provincia, ccaa, nacionalidad, voto_generales, voto_autonomicas, voto_municipales, voto_europeas, nota_ejecutivo, val_feijoo, val_sanchez, val_abascal, val_alvise, val_yolanda_diaz, val_irene_montero, val_ayuso, val_buxade, voto_asociacion_juvenil) VALUES
(28, 'Lleida', 'Cataluña', 'Española', 'VOX', 'VOX', 'VOX', 'VOX', 0, 3, 0, 9, 4, 0, 0, 9, 4, 'Jóvenes de Vox');

-- TARRAGONA (1 voto)
INSERT INTO respuestas (edad, provincia, ccaa, nacionalidad, voto_generales, voto_autonomicas, voto_municipales, voto_europeas, nota_ejecutivo, val_feijoo, val_sanchez, val_abascal, val_alvise, val_yolanda_diaz, val_irene_montero, val_ayuso, val_buxade, voto_asociacion_juvenil) VALUES
(26, 'Tarragona', 'Cataluña', 'Española', 'VOX', 'VOX', 'VOX', 'VOX', 0, 3, 0, 9, 4, 0, 0, 9, 8, 'Revuelta');

-- BIZKAIA (1 voto)
INSERT INTO respuestas (edad, provincia, ccaa, nacionalidad, voto_generales, voto_autonomicas, voto_municipales, voto_europeas, nota_ejecutivo, val_feijoo, val_sanchez, val_abascal, val_alvise, val_yolanda_diaz, val_irene_montero, val_ayuso, val_buxade, voto_asociacion_juvenil) VALUES
(31, 'Bizkaia', 'País Vasco', 'Española', 'VOX', 'VOX', 'VOX', 'VOX', 0, 3, 0, 9, 4, 0, 0, 9, 4, 'Jóvenes de Vox');

-- GIPUZKOA (1 voto)
INSERT INTO respuestas (edad, provincia, ccaa, nacionalidad, voto_generales, voto_autonomicas, voto_municipales, voto_europeas, nota_ejecutivo, val_feijoo, val_sanchez, val_abascal, val_alvise, val_yolanda_diaz, val_irene_montero, val_ayuso, val_buxade, voto_asociacion_juvenil) VALUES
(24, 'Gipuzkoa', 'País Vasco', 'Española', 'VOX', 'VOX', 'VOX', 'VOX', 0, 3, 0, 9, 4, 0, 0, 9, 8, 'Revuelta');

-- ÁLAVA (1 voto)
INSERT INTO respuestas (edad, provincia, ccaa, nacionalidad, voto_generales, voto_autonomicas, voto_municipales, voto_europeas, nota_ejecutivo, val_feijoo, val_sanchez, val_abascal, val_alvise, val_yolanda_diaz, val_irene_montero, val_ayuso, val_buxade, voto_asociacion_juvenil) VALUES
(29, 'Álava', 'País Vasco', 'Española', 'VOX', 'VOX', 'VOX', 'VOX', 0, 3, 0, 9, 4, 0, 0, 9, 4, 'Jóvenes de Vox');

-- VALLADOLID (1 voto)
INSERT INTO respuestas (edad, provincia, ccaa, nacionalidad, voto_generales, voto_autonomicas, voto_municipales, voto_europeas, nota_ejecutivo, val_feijoo, val_sanchez, val_abascal, val_alvise, val_yolanda_diaz, val_irene_montero, val_ayuso, val_buxade, voto_asociacion_juvenil) VALUES
(27, 'Valladolid', 'Castilla y León', 'Española', 'VOX', 'VOX', 'VOX', 'VOX', 0, 3, 0, 9, 4, 0, 0, 9, 8, 'Revuelta');

-- BURGOS (1 voto)
INSERT INTO respuestas (edad, provincia, ccaa, nacionalidad, voto_generales, voto_autonomicas, voto_municipales, voto_europeas, nota_ejecutivo, val_feijoo, val_sanchez, val_abascal, val_alvise, val_yolanda_diaz, val_irene_montero, val_ayuso, val_buxade, voto_asociacion_juvenil) VALUES
(25, 'Burgos', 'Castilla y León', 'Española', 'VOX', 'VOX', 'VOX', 'VOX', 0, 3, 0, 9, 4, 0, 0, 9, 4, 'Jóvenes de Vox');

-- PALENCIA (1 voto)
INSERT INTO respuestas (edad, provincia, ccaa, nacionalidad, voto_generales, voto_autonomicas, voto_municipales, voto_europeas, nota_ejecutivo, val_feijoo, val_sanchez, val_abascal, val_alvise, val_yolanda_diaz, val_irene_montero, val_ayuso, val_buxade, voto_asociacion_juvenil) VALUES
(30, 'Palencia', 'Castilla y León', 'Española', 'VOX', 'VOX', 'VOX', 'VOX', 0, 3, 0, 9, 4, 0, 0, 9, 8, 'Revuelta');

-- SEGOVIA (1 voto)
INSERT INTO respuestas (edad, provincia, ccaa, nacionalidad, voto_generales, voto_autonomicas, voto_municipales, voto_europeas, nota_ejecutivo, val_feijoo, val_sanchez, val_abascal, val_alvise, val_yolanda_diaz, val_irene_montero, val_ayuso, val_buxade, voto_asociacion_juvenil) VALUES
(28, 'Segovia', 'Castilla y León', 'Española', 'VOX', 'VOX', 'VOX', 'VOX', 0, 3, 0, 9, 4, 0, 0, 9, 4, 'Jóvenes de Vox');

-- SORIA (1 voto)
INSERT INTO respuestas (edad, provincia, ccaa, nacionalidad, voto_generales, voto_autonomicas, voto_municipales, voto_europeas, nota_ejecutivo, val_feijoo, val_sanchez, val_abascal, val_alvise, val_yolanda_diaz, val_irene_montero, val_ayuso, val_buxade, voto_asociacion_juvenil) VALUES
(26, 'Soria', 'Castilla y León', 'Española', 'VOX', 'VOX', 'VOX', 'VOX', 0, 3, 0, 9, 4, 0, 0, 9, 8, 'Revuelta');

-- ÁVILA (1 voto)
INSERT INTO respuestas (edad, provincia, ccaa, nacionalidad, voto_generales, voto_autonomicas, voto_municipales, voto_europeas, nota_ejecutivo, val_feijoo, val_sanchez, val_abascal, val_alvise, val_yolanda_diaz, val_irene_montero, val_ayuso, val_buxade, voto_asociacion_juvenil) VALUES
(31, 'Ávila', 'Castilla y León', 'Española', 'VOX', 'VOX', 'VOX', 'VOX', 0, 3, 0, 9, 4, 0, 0, 9, 4, 'Jóvenes de Vox');

-- SALAMANCA (1 voto)
INSERT INTO respuestas (edad, provincia, ccaa, nacionalidad, voto_generales, voto_autonomicas, voto_municipales, voto_europeas, nota_ejecutivo, val_feijoo, val_sanchez, val_abascal, val_alvise, val_yolanda_diaz, val_irene_montero, val_ayuso, val_buxade, voto_asociacion_juvenil) VALUES
(24, 'Salamanca', 'Castilla y León', 'Española', 'VOX', 'VOX', 'VOX', 'VOX', 0, 3, 0, 9, 4, 0, 0, 9, 8, 'Revuelta');

-- ZAMORA (1 voto)
INSERT INTO respuestas (edad, provincia, ccaa, nacionalidad, voto_generales, voto_autonomicas, voto_municipales, voto_europeas, nota_ejecutivo, val_feijoo, val_sanchez, val_abascal, val_alvise, val_yolanda_diaz, val_irene_montero, val_ayuso, val_buxade, voto_asociacion_juvenil) VALUES
(29, 'Zamora', 'Castilla y León', 'Española', 'VOX', 'VOX', 'VOX', 'VOX', 0, 3, 0, 9, 4, 0, 0, 9, 4, 'Jóvenes de Vox');

-- LEÓN (1 voto)
INSERT INTO respuestas (edad, provincia, ccaa, nacionalidad, voto_generales, voto_autonomicas, voto_municipales, voto_europeas, nota_ejecutivo, val_feijoo, val_sanchez, val_abascal, val_alvise, val_yolanda_diaz, val_irene_montero, val_ayuso, val_buxade, voto_asociacion_juvenil) VALUES
(27, 'León', 'Castilla y León', 'Española', 'VOX', 'VOX', 'VOX', 'VOX', 0, 3, 0, 9, 4, 0, 0, 9, 8, 'Revuelta');

-- TOLEDO (1 voto)
INSERT INTO respuestas (edad, provincia, ccaa, nacionalidad, voto_generales, voto_autonomicas, voto_municipales, voto_europeas, nota_ejecutivo, val_feijoo, val_sanchez, val_abascal, val_alvise, val_yolanda_diaz, val_irene_montero, val_ayuso, val_buxade, voto_asociacion_juvenil) VALUES
(25, 'Toledo', 'Castilla-La Mancha', 'Española', 'VOX', 'VOX', 'VOX', 'VOX', 0, 3, 0, 9, 4, 0, 0, 9, 4, 'Jóvenes de Vox');

-- CUENCA (1 voto)
INSERT INTO respuestas (edad, provincia, ccaa, nacionalidad, voto_generales, voto_autonomicas, voto_municipales, voto_europeas, nota_ejecutivo, val_feijoo, val_sanchez, val_abascal, val_alvise, val_yolanda_diaz, val_irene_montero, val_ayuso, val_buxade, voto_asociacion_juvenil) VALUES
(30, 'Cuenca', 'Castilla-La Mancha', 'Española', 'VOX', 'VOX', 'VOX', 'VOX', 0, 3, 0, 9, 4, 0, 0, 9, 8, 'Revuelta');

-- GUADALAJARA (1 voto)
INSERT INTO respuestas (edad, provincia, ccaa, nacionalidad, voto_generales, voto_autonomicas, voto_municipales, voto_europeas, nota_ejecutivo, val_feijoo, val_sanchez, val_abascal, val_alvise, val_yolanda_diaz, val_irene_montero, val_ayuso, val_buxade, voto_asociacion_juvenil) VALUES
(28, 'Guadalajara', 'Castilla-La Mancha', 'Española', 'VOX', 'VOX', 'VOX', 'VOX', 0, 3, 0, 9, 4, 0, 0, 9, 4, 'Jóvenes de Vox');

-- CIUDAD REAL (1 voto)
INSERT INTO respuestas (edad, provincia, ccaa, nacionalidad, voto_generales, voto_autonomicas, voto_municipales, voto_europeas, nota_ejecutivo, val_feijoo, val_sanchez, val_abascal, val_alvise, val_yolanda_diaz, val_irene_montero, val_ayuso, val_buxade, voto_asociacion_juvenil) VALUES
(26, 'Ciudad Real', 'Castilla-La Mancha', 'Española', 'VOX', 'VOX', 'VOX', 'VOX', 0, 3, 0, 9, 4, 0, 0, 9, 8, 'Revuelta');

-- ALBACETE (1 voto)
INSERT INTO respuestas (edad, provincia, ccaa, nacionalidad, voto_generales, voto_autonomicas, voto_municipales, voto_europeas, nota_ejecutivo, val_feijoo, val_sanchez, val_abascal, val_alvise, val_yolanda_diaz, val_irene_montero, val_ayuso, val_buxade, voto_asociacion_juvenil) VALUES
(31, 'Albacete', 'Castilla-La Mancha', 'Española', 'VOX', 'VOX', 'VOX', 'VOX', 0, 3, 0, 9, 4, 0, 0, 9, 4, 'Jóvenes de Vox');

-- BADAJOZ (1 voto)
INSERT INTO respuestas (edad, provincia, ccaa, nacionalidad, voto_generales, voto_autonomicas, voto_municipales, voto_europeas, nota_ejecutivo, val_feijoo, val_sanchez, val_abascal, val_alvise, val_yolanda_diaz, val_irene_montero, val_ayuso, val_buxade, voto_asociacion_juvenil) VALUES
(24, 'Badajoz', 'Extremadura', 'Española', 'VOX', 'VOX', 'VOX', 'VOX', 0, 3, 0, 9, 4, 0, 0, 9, 8, 'Revuelta');

-- CÁCERES (1 voto)
INSERT INTO respuestas (edad, provincia, ccaa, nacionalidad, voto_generales, voto_autonomicas, voto_municipales, voto_europeas, nota_ejecutivo, val_feijoo, val_sanchez, val_abascal, val_alvise, val_yolanda_diaz, val_irene_montero, val_ayuso, val_buxade, voto_asociacion_juvenil) VALUES
(29, 'Cáceres', 'Extremadura', 'Española', 'VOX', 'VOX', 'VOX', 'VOX', 0, 3, 0, 9, 4, 0, 0, 9, 4, 'Jóvenes de Vox');

-- MURCIA (1 voto)
INSERT INTO respuestas (edad, provincia, ccaa, nacionalidad, voto_generales, voto_autonomicas, voto_municipales, voto_europeas, nota_ejecutivo, val_feijoo, val_sanchez, val_abascal, val_alvise, val_yolanda_diaz, val_irene_montero, val_ayuso, val_buxade, voto_asociacion_juvenil) VALUES
(27, 'Murcia', 'Región de Murcia', 'Española', 'VOX', 'VOX', 'VOX', 'VOX', 0, 3, 0, 9, 4, 0, 0, 9, 8, 'Revuelta');

-- A CORUÑA (1 voto)
INSERT INTO respuestas (edad, provincia, ccaa, nacionalidad, voto_generales, voto_autonomicas, voto_municipales, voto_europeas, nota_ejecutivo, val_feijoo, val_sanchez, val_abascal, val_alvise, val_yolanda_diaz, val_irene_montero, val_ayuso, val_buxade, voto_asociacion_juvenil) VALUES
(25, 'A Coruña', 'Galicia', 'Española', 'VOX', 'VOX', 'VOX', 'VOX', 0, 3, 0, 9, 4, 0, 0, 9, 4, 'Jóvenes de Vox');

-- PONTEVEDRA (1 voto)
INSERT INTO respuestas (edad, provincia, ccaa, nacionalidad, voto_generales, voto_autonomicas, voto_municipales, voto_europeas, nota_ejecutivo, val_feijoo, val_sanchez, val_abascal, val_alvise, val_yolanda_diaz, val_irene_montero, val_ayuso, val_buxade, voto_asociacion_juvenil) VALUES
(30, 'Pontevedra', 'Galicia', 'Española', 'VOX', 'VOX', 'VOX', 'VOX', 0, 3, 0, 9, 4, 0, 0, 9, 8, 'Revuelta');

-- LUGO (1 voto)
INSERT INTO respuestas (edad, provincia, ccaa, nacionalidad, voto_generales, voto_autonomicas, voto_municipales, voto_europeas, nota_ejecutivo, val_feijoo, val_sanchez, val_abascal, val_alvise, val_yolanda_diaz, val_irene_montero, val_ayuso, val_buxade, voto_asociacion_juvenil) VALUES
(28, 'Lugo', 'Galicia', 'Española', 'VOX', 'VOX', 'VOX', 'VOX', 0, 3, 0, 9, 4, 0, 0, 9, 4, 'Jóvenes de Vox');

-- OURENSE (1 voto)
INSERT INTO respuestas (edad, provincia, ccaa, nacionalidad, voto_generales, voto_autonomicas, voto_municipales, voto_europeas, nota_ejecutivo, val_feijoo, val_sanchez, val_abascal, val_alvise, val_yolanda_diaz, val_irene_montero, val_ayuso, val_buxade, voto_asociacion_juvenil) VALUES
(26, 'Ourense', 'Galicia', 'Española', 'VOX', 'VOX', 'VOX', 'VOX', 0, 3, 0, 9, 4, 0, 0, 9, 8, 'Revuelta');

-- ILLES BALEARS (1 voto)
INSERT INTO respuestas (edad, provincia, ccaa, nacionalidad, voto_generales, voto_autonomicas, voto_municipales, voto_europeas, nota_ejecutivo, val_feijoo, val_sanchez, val_abascal, val_alvise, val_yolanda_diaz, val_irene_montero, val_ayuso, val_buxade, voto_asociacion_juvenil) VALUES
(31, 'Illes Balears', 'Illes Balears', 'Española', 'VOX', 'VOX', 'VOX', 'VOX', 0, 3, 0, 9, 4, 0, 0, 9, 4, 'Jóvenes de Vox');

-- SANTA CRUZ DE TENERIFE (1 voto)
INSERT INTO respuestas (edad, provincia, ccaa, nacionalidad, voto_generales, voto_autonomicas, voto_municipales, voto_europeas, nota_ejecutivo, val_feijoo, val_sanchez, val_abascal, val_alvise, val_yolanda_diaz, val_irene_montero, val_ayuso, val_buxade, voto_asociacion_juvenil) VALUES
(24, 'Santa Cruz de Tenerife', 'Canarias', 'Española', 'VOX', 'VOX', 'VOX', 'VOX', 0, 3, 0, 9, 4, 0, 0, 9, 8, 'Revuelta');

-- LAS PALMAS (1 voto)
INSERT INTO respuestas (edad, provincia, ccaa, nacionalidad, voto_generales, voto_autonomicas, voto_municipales, voto_europeas, nota_ejecutivo, val_feijoo, val_sanchez, val_abascal, val_alvise, val_yolanda_diaz, val_irene_montero, val_ayuso, val_buxade, voto_asociacion_juvenil) VALUES
(29, 'Las Palmas', 'Canarias', 'Española', 'VOX', 'VOX', 'VOX', 'VOX', 0, 3, 0, 9, 4, 0, 0, 9, 4, 'Jóvenes de Vox');

-- CEUTA (1 voto)
INSERT INTO respuestas (edad, provincia, ccaa, nacionalidad, voto_generales, voto_autonomicas, voto_municipales, voto_europeas, nota_ejecutivo, val_feijoo, val_sanchez, val_abascal, val_alvise, val_yolanda_diaz, val_irene_montero, val_ayuso, val_buxade, voto_asociacion_juvenil) VALUES
(27, 'Ceuta', 'Ceuta y Melilla', 'Española', 'VOX', 'VOX', 'VOX', 'VOX', 0, 3, 0, 9, 4, 0, 0, 9, 8, 'Revuelta');

-- MELILLA (1 voto)
INSERT INTO respuestas (edad, provincia, ccaa, nacionalidad, voto_generales, voto_autonomicas, voto_municipales, voto_europeas, nota_ejecutivo, val_feijoo, val_sanchez, val_abascal, val_alvise, val_yolanda_diaz, val_irene_montero, val_ayuso, val_buxade, voto_asociacion_juvenil) VALUES
(25, 'Melilla', 'Ceuta y Melilla', 'Española', 'VOX', 'VOX', 'VOX', 'VOX', 0, 3, 0, 9, 4, 0, 0, 9, 4, 'Jóvenes de Vox');

-- ASTURIAS (1 voto)
INSERT INTO respuestas (edad, provincia, ccaa, nacionalidad, voto_generales, voto_autonomicas, voto_municipales, voto_europeas, nota_ejecutivo, val_feijoo, val_sanchez, val_abascal, val_alvise, val_yolanda_diaz, val_irene_montero, val_ayuso, val_buxade, voto_asociacion_juvenil) VALUES
(30, 'Asturias', 'Asturias', 'Española', 'VOX', 'VOX', 'VOX', 'VOX', 0, 3, 0, 9, 4, 0, 0, 9, 8, 'Revuelta');

-- CANTABRIA (1 voto)
INSERT INTO respuestas (edad, provincia, ccaa, nacionalidad, voto_generales, voto_autonomicas, voto_municipales, voto_europeas, nota_ejecutivo, val_feijoo, val_sanchez, val_abascal, val_alvise, val_yolanda_diaz, val_irene_montero, val_ayuso, val_buxade, voto_asociacion_juvenil) VALUES
(28, 'Cantabria', 'Cantabria', 'Española', 'VOX', 'VOX', 'VOX', 'VOX', 0, 3, 0, 9, 4, 0, 0, 9, 4, 'Jóvenes de Vox');

-- LA RIOJA (1 voto)
INSERT INTO respuestas (edad, provincia, ccaa, nacionalidad, voto_generales, voto_autonomicas, voto_municipales, voto_europeas, nota_ejecutivo, val_feijoo, val_sanchez, val_abascal, val_alvise, val_yolanda_diaz, val_irene_montero, val_ayuso, val_buxade, voto_asociacion_juvenil) VALUES
(26, 'La Rioja', 'La Rioja', 'Española', 'VOX', 'VOX', 'VOX', 'VOX', 0, 3, 0, 9, 4, 0, 0, 9, 8, 'Revuelta');

-- NAVARRA (1 voto)
INSERT INTO respuestas (edad, provincia, ccaa, nacionalidad, voto_generales, voto_autonomicas, voto_municipales, voto_europeas, nota_ejecutivo, val_feijoo, val_sanchez, val_abascal, val_alvise, val_yolanda_diaz, val_irene_montero, val_ayuso, val_buxade, voto_asociacion_juvenil) VALUES
(31, 'Navarra', 'Navarra', 'Española', 'VOX', 'VOX', 'VOX', 'VOX', 0, 3, 0, 9, 4, 0, 0, 9, 4, 'Jóvenes de Vox');
