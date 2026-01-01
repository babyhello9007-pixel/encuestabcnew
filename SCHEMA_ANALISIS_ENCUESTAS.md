# Esquema de Análisis de Encuestas Externas

## Descripción General

Este esquema permite agregar, analizar y comparar datos de encuestas externas de múltiples encuestadoras. Los datos se organizan en tablas relacionales que facilitan el análisis de tendencias políticas, comparativas entre encuestadoras y alertas de cambios significativos.

## Tablas Principales

### 1. `encuestadoras`
Catálogo de empresas de sondeos/encuestadoras.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | INT | Identificador único (PK) |
| `nombre` | VARCHAR(100) | Nombre de la encuestadora (UNIQUE) |
| `sigla` | VARCHAR(20) | Sigla/abreviatura de la encuestadora |
| `pais` | VARCHAR(50) | País donde opera (default: "España") |
| `sitio_web` | TEXT | URL del sitio web |
| `credibilidad` | INT | Puntuación de credibilidad (0-100) |
| `created_at` | TIMESTAMP | Fecha de creación |

**Ejemplo de datos:**
```sql
INSERT INTO encuestadoras (nombre, sigla, pais, credibilidad)
VALUES 
  ('CIS', 'CIS', 'España', 85),
  ('Metroscopia', 'METRO', 'España', 80),
  ('Sigma Dos', 'SD', 'España', 75);
```

### 2. `encuestas_externas`
Metadata de encuestas de terceros (una encuesta por fila).

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | INT | Identificador único (PK) |
| `encuestadora_id` | INT | FK a `encuestadoras` |
| `tipo_encuesta` | VARCHAR(50) | 'generales', 'autonomicas', 'municipales', 'europeas' |
| `ambito` | VARCHAR(50) | 'nacional', 'ccaa', 'provincia' |
| `ccaa_o_provincia` | VARCHAR(100) | Nombre de CCAA o provincia (si aplica) |
| `fecha_publicacion` | TIMESTAMP | Fecha de publicación del sondeo |
| `fecha_encuesta_inicio` | TIMESTAMP | Inicio del período de encuesta |
| `fecha_encuesta_fin` | TIMESTAMP | Fin del período de encuesta |
| `tamano_muestra` | INT | Tamaño de la muestra |
| `margen_error` | INT | Margen de error (0-100, ej: 3 = 3%) |
| `metodologia` | TEXT | Descripción de la metodología |
| `created_at` | TIMESTAMP | Fecha de creación del registro |

**Ejemplo:**
```sql
INSERT INTO encuestas_externas 
(encuestadora_id, tipo_encuesta, ambito, fecha_publicacion, tamano_muestra, margen_error)
VALUES 
(1, 'generales', 'nacional', '2025-01-01', 1500, 3);
```

### 3. `resultados_encuestas`
Resultados de cada partido en cada encuesta (múltiples filas por encuesta).

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | INT | Identificador único (PK) |
| `encuesta_id` | INT | FK a `encuestas_externas` |
| `partido_id` | VARCHAR(100) | ID del partido (coincide con `voto_generales` de `respuestas`) |
| `votos` | INT | Número de votos (si aplica) |
| `porcentaje` | INT | Porcentaje de intención de voto (0-100) |
| `escanos` | INT | Número de escaños proyectados |
| `created_at` | TIMESTAMP | Fecha de creación |

**Ejemplo:**
```sql
INSERT INTO resultados_encuestas 
(encuesta_id, partido_id, porcentaje, escanos)
VALUES 
(1, 'PP', 25, 120),
(1, 'PSOE', 22, 110),
(1, 'VOX', 15, 45);
```

### 4. `tendencias_agregadas`
Cálculos precomputados de tendencias (tabla de caché para optimización).

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | INT | Identificador único (PK) |
| `partido_id` | VARCHAR(100) | ID del partido |
| `tipo_encuesta` | VARCHAR(50) | Tipo de encuesta |
| `ambito` | VARCHAR(50) | Ámbito geográfico |
| `ccaa_o_provincia` | VARCHAR(100) | Región específica (si aplica) |
| `fecha` | TIMESTAMP | Fecha del cálculo |
| `media_7_dias` | INT | Media móvil 7 días (0-100) |
| `media_14_dias` | INT | Media móvil 14 días |
| `media_30_dias` | INT | Media móvil 30 días |
| `tendencia` | VARCHAR(20) | 'subida', 'bajada', 'estable' |
| `cambio_7_dias` | INT | Cambio respecto a período anterior (-100 a 100) |
| `cambio_30_dias` | INT | Cambio a 30 días |
| `created_at` | TIMESTAMP | Fecha de creación |

## Vistas SQL

### 1. `v_resultados_brutos`
Resultados crudos de encuestas con información de encuestadora.

```sql
SELECT * FROM v_resultados_brutos
WHERE tipo_encuesta = 'generales' AND fecha_publicacion >= DATE_SUB(NOW(), INTERVAL 30 DAY)
ORDER BY fecha_publicacion DESC;
```

**Columnas:** encuesta_id, encuestadora, tipo_encuesta, ambito, ccaa_o_provincia, fecha_publicacion, partido_id, votos, porcentaje, escanos, tamano_muestra, margen_error

### 2. `v_media_encuestas_por_fecha`
Promedio de resultados agrupado por fecha y partido.

```sql
SELECT * FROM v_media_encuestas_por_fecha
WHERE tipo_encuesta = 'generales' AND fecha >= DATE_SUB(CURDATE(), INTERVAL 30 DAY);
```

**Columnas:** fecha, tipo_encuesta, ambito, ccaa_o_provincia, partido_id, media_porcentaje, media_escanos, num_encuestas

### 3. `v_tendencias_7_dias`
Tendencias de los últimos 7 días vs. 7 días anteriores.

```sql
SELECT * FROM v_tendencias_7_dias
WHERE tipo_encuesta = 'generales'
ORDER BY media_7_dias DESC;
```

**Columnas:** partido_id, tipo_encuesta, ambito, ccaa_o_provincia, media_7_dias, media_anterior_7_dias, num_encuestas

### 4. `v_tendencias_30_dias`
Tendencias de los últimos 30 días vs. 30 días anteriores.

```sql
SELECT * FROM v_tendencias_30_dias
WHERE tipo_encuesta = 'generales';
```

**Columnas:** partido_id, tipo_encuesta, ambito, ccaa_o_provincia, media_30_dias, media_anterior_30_dias, num_encuestas

### 5. `v_comparativa_encuestadoras`
Comparativa de resultados entre diferentes encuestadoras.

```sql
SELECT * FROM v_comparativa_encuestadoras
WHERE tipo_encuesta = 'generales' AND fecha_publicacion >= DATE_SUB(NOW(), INTERVAL 7 DAY)
ORDER BY fecha_publicacion DESC, encuestadora;
```

**Columnas:** encuestadora, tipo_encuesta, ambito, ccaa_o_provincia, fecha_publicacion, partido_id, porcentaje, escanos, rango_fecha

### 6. `v_ranking_partidos_media`
Ranking de partidos por media de intención de voto.

```sql
SELECT * FROM v_ranking_partidos_media
WHERE tipo_encuesta = 'generales' AND ranking <= 10
ORDER BY ranking;
```

**Columnas:** partido_id, tipo_encuesta, ambito, ccaa_o_provincia, media_porcentaje, media_escanos, num_encuestas, ranking

### 7. `v_alertas_politicas`
Alertas de cambios significativos en intención de voto.

```sql
SELECT * FROM v_alertas_politicas
WHERE tipo_alerta != 'SIN_CAMBIO'
ORDER BY ABS(cambio) DESC;
```

**Columnas:** partido_id, tipo_encuesta, ambito, ccaa_o_provincia, media_semana_actual, media_semana_anterior, cambio, tipo_alerta, direccion, num_encuestas

**Tipos de alerta:**
- `CAMBIO_SIGNIFICATIVO`: Cambio > 3%
- `CAMBIO_MODERADO`: Cambio 1.5% - 3%
- `CAMBIO_LEVE`: Cambio 0.5% - 1.5%
- `SIN_CAMBIO`: Cambio < 0.5%

## Relación con Tabla `respuestas`

El campo `partido_id` en `resultados_encuestas` debe coincidir con los valores de `voto_generales` en la tabla `respuestas`.

**Valores válidos de `partido_id` (ejemplos):**
- PP
- PSOE
- VOX
- Podemos
- Ciudadanos
- ERC
- JxCat
- BNG
- Otros

## Índices para Optimización

Se han creado los siguientes índices:

```sql
CREATE INDEX idx_encuestas_externas_fecha ON encuestas_externas(fecha_publicacion);
CREATE INDEX idx_encuestas_externas_tipo ON encuestas_externas(tipo_encuesta);
CREATE INDEX idx_resultados_encuestas_partido ON resultados_encuestas(partido_id);
CREATE INDEX idx_resultados_encuestas_encuesta ON resultados_encuestas(encuesta_id);
CREATE INDEX idx_tendencias_agregadas_partido ON tendencias_agregadas(partido_id);
CREATE INDEX idx_tendencias_agregadas_fecha ON tendencias_agregadas(fecha);
```

## Casos de Uso

### 1. Obtener tendencia de un partido en últimos 30 días
```sql
SELECT * FROM v_tendencias_30_dias
WHERE partido_id = 'PP' AND tipo_encuesta = 'generales'
LIMIT 1;
```

### 2. Comparar resultados entre encuestadoras
```sql
SELECT encuestadora, partido_id, porcentaje, fecha_publicacion
FROM v_resultados_brutos
WHERE tipo_encuesta = 'generales' 
  AND fecha_publicacion >= DATE_SUB(NOW(), INTERVAL 7 DAY)
ORDER BY fecha_publicacion DESC, encuestadora;
```

### 3. Detectar cambios significativos
```sql
SELECT * FROM v_alertas_politicas
WHERE tipo_alerta = 'CAMBIO_SIGNIFICATIVO'
  AND tipo_encuesta = 'generales'
ORDER BY ABS(cambio) DESC;
```

### 4. Ranking actual de partidos
```sql
SELECT partido_id, media_porcentaje, ranking
FROM v_ranking_partidos_media
WHERE tipo_encuesta = 'generales' AND ranking <= 5
ORDER BY ranking;
```

## Notas Importantes

1. **Almacenamiento de porcentajes:** Los porcentajes se almacenan como INT (0-100) para optimización. Dividir por 100 para obtener decimales si es necesario.

2. **Almacenamiento de márgenes de error:** Se almacenan como INT (0-100). Un valor de 3 representa 3%.

3. **Vistas dinámicas:** Las vistas utilizan `CURDATE()` y `DATE_SUB()` para cálculos dinámicos. Los períodos se recalculan automáticamente cada día.

4. **Coincidencia de partido_id:** Es crítico que los valores en `partido_id` coincidan exactamente con los valores de `voto_generales` en la tabla `respuestas` para análisis correlacionados.

5. **Actualización de tendencias:** La tabla `tendencias_agregadas` debe actualizarse periódicamente (diariamente recomendado) mediante un proceso batch o trigger.

## Integración con Respuestas de Usuarios

El sistema permite correlacionar:
- Intención de voto en `respuestas.voto_generales` con
- Resultados reales de encuestas en `resultados_encuestas.partido_id`

Esto permite análisis como:
- Comparar intención de voto de usuarios vs. encuestas oficiales
- Detectar sesgos en la muestra de usuarios
- Validar representatividad de la encuesta interna
