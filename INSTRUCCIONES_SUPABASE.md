# Instrucciones para Configurar Supabase

## Paso 1: Ejecutar el Script SQL Principal

Ve a tu proyecto en Supabase → SQL Editor → New Query y copia el contenido del archivo `supabase_final_setup.sql`. Ejecuta el script completo.

Este script crea:
- ✅ Tabla de políticos con imágenes
- ✅ Tabla de comentarios con RLS
- ✅ Tabla de tracking de compartir
- ✅ Vistas de estadísticas (edad e ideología por partido/asociación)
- ✅ Políticas de seguridad

## Paso 2: Verificar las Vistas Existentes

Las siguientes vistas ya existen en tu base de datos y se usan para las métricas del PDF:

```sql
-- Vista de edad e ideología por partido
SELECT * FROM public.edad_ideologia_por_partido;

-- Vista de edad e ideología por asociación
SELECT * FROM public.edad_ideologia_por_asociacion;

-- Vista de valoraciones de políticos
SELECT * FROM public.valoraciones_politicos_promedio;
```

## Paso 3: Verificar Tablas Principales

Asegúrate de que estas tablas existen y tienen datos:

```sql
-- Tabla principal de respuestas
SELECT COUNT(*) FROM public.respuestas;

-- Debe tener columnas como:
-- - voto_generales (texto)
-- - voto_asociacion_juvenil (texto)
-- - edad (número)
-- - posicion_ideologica (número)
-- - politico (texto)
-- - val_feijoo, val_sanchez, val_abascal, etc. (números)
```

## Paso 4: Habilitar Lectura Pública de Vistas

Si las vistas no son accesibles públicamente, ejecuta:

```sql
-- Habilitar lectura pública de vistas
GRANT SELECT ON public.edad_ideologia_por_partido TO anon, authenticated;
GRANT SELECT ON public.edad_ideologia_por_asociacion TO anon, authenticated;
GRANT SELECT ON public.valoraciones_politicos_promedio TO anon, authenticated;
```

## Paso 5: Probar la Conexión

Desde la aplicación web, verifica que:
1. Los comentarios se cargan correctamente
2. El PDF se descarga con las métricas
3. Las imágenes de políticos se muestran

## Archivos Relacionados

- `supabase_final_setup.sql` - Script SQL completo
- `supabase_complete_setup.sql` - Script alternativo con más tablas (opcional)
- `client/src/components/CommentsSection.tsx` - Componente de comentarios mejorado
- `client/src/lib/pdfExportAdvanced.ts` - Función de exportación a PDF con métricas

## Troubleshooting

### Los comentarios no se cargan
1. Verifica que la tabla `comentarios_resultados` existe
2. Comprueba que RLS está habilitado correctamente
3. Asegúrate de que la política `Allow public read comments` existe

### El PDF no muestra métricas
1. Verifica que las vistas `edad_ideologia_por_partido` y `edad_ideologia_por_asociacion` existen
2. Comprueba que tienen datos ejecutando:
   ```sql
   SELECT * FROM public.edad_ideologia_por_partido LIMIT 5;
   ```

### Las imágenes de políticos no se muestran
1. Verifica que la tabla `politicos` tiene datos
2. Comprueba que los campos `imagen_url` tienen rutas correctas
3. Asegúrate de que las imágenes existen en `/assets/images/`

## Contacto y Soporte

Si tienes problemas, verifica:
1. Los logs de la consola del navegador (F12 → Console)
2. Los logs de Supabase (Dashboard → Logs)
3. Las políticas RLS en Supabase (Authentication → Policies)

