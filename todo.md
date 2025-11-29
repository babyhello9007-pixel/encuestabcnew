# III Encuesta de Batalla Cultural - TODO

## Configuración y Base de Datos
- [x] Crear esquema SQL en Supabase
- [x] Insertar datos iniciales de partidos políticos
- [x] Insertar datos iniciales de asociaciones juveniles
- [x] Configurar RLS (Row-Level Security) en Supabase

## Desarrollo Frontend
- [x] Configurar conexión con Supabase en el proyecto
- [x] Crear página de inicio (landing page) con presentación de la encuesta
- [x] Crear formulario de encuesta con todas las preguntas
- [x] Implementar navegación entre preguntas (anterior/siguiente)
- [x] Implementar barra de progreso de la encuesta
- [x] Implementar validación de respuestas
- [x] Implementar envío de respuestas a Supabase
- [x] Crear página de agradecimiento post-encuesta
- [x] Crear página de resultados con visualización de datos
- [x] Implementar gráficos interactivos para resultados
- [x] Crear página "Acerca de" / Metodología

## Cálculo de Escaños (Ley d'Hondt)
- [x] Implementar función de cálculo de escaños para elecciones generales (350 escaños, umbral 3%)
- [x] Implementar función de cálculo de escaños para asociaciones juveniles (50 escaños, umbral 7%)
- [x] Integrar cálculo de escaños en la página de resultados

## Diseño y Estilo
- [x] Configurar paleta de colores (beige, gris, escarlata)
- [x] Configurar tipografía (Inter, Poppins o Montserrat)
- [x] Diseñar layout responsive
- [x] Aplicar favicon (logo BC)
- [x] Crear componentes reutilizables
- [x] Implementar estilos frosted glass y liquid glass

## Fallos Reportados - URGENTE
- [x] Verificar que todos los logotipos de partidos se muestren en resultados
- [x] Agregar fotos de políticos en sección de valoración
- [x] Verificar que asociaciones juveniles muestren sus logotipos correctamente
- [ ] Mejorar paleta de colores para mejor contraste y visibilidad
- [ ] Optimizar responsividad en diferentes dispositivos
- [x] Agregar documentación de uso en página "Acerca de"

## Conversión a Full-Stack - NUEVO
- [x] Convertir proyecto a full-stack con servidor backend
- [x] Integrar base de datos Supabase con tablas de partidos y asociaciones
- [x] Agregar logo_path a tablas de partidos_generales y asociaciones_juveniles
- [ ] Mostrar logotipos correctamente en página de resultados desde BD (PRIORITARIO)
- [ ] Adaptar tarjetas de líderes políticos a las imágenes y mostrar todas (PRIORITARIO)
- [x] Crear panel de administrador para gestión de archivos
- [x] Implementar función de carga de archivos a S3
- [x] Crear interfaz de explorador de archivos para admin
- [x] Editor de código con Monaco Editor
- [x] Permitir editar archivos del proyecto desde admin (main.tsx, etc.)
- [ ] Crear editor de código que acceda a archivos reales del proyecto
- [ ] Implementar lectura de archivos del proyecto (client/src, server, drizzle, etc.)
- [ ] Implementar edición y guardado de archivos reales
- [ ] Agregar previsualización de cambios antes de guardar

## Pruebas y Optimización
- [ ] Pruebas funcionales de la encuesta
- [ ] Pruebas de envío de datos a Supabase
- [ ] Pruebas de visualización de resultados
- [ ] Optimización de rendimiento
- [ ] Pruebas de responsividad en diferentes dispositivos

## Despliegue
- [ ] Preparar para publicación
- [ ] Crear checkpoint final
- [ ] Documentación de uso



## NanoEncuestaBC - Nueva Encuesta Compacta
- [x] Crear página NanoEncuestaBC.tsx con formulario compacto
- [x] Implementar preguntas: edad, provincia, comunidad autónoma, nacionalidad
- [x] Agregar preguntas de voto: generales, autonómicas, municipales, europeas
- [x] Implementar pregunta de nota al ejecutivo (0-10)
- [x] Agregar valoración de líderes políticos (Feijóo, Sánchez, Abascal, etc.)
- [x] Implementar pregunta de asociación juvenil
- [x] Crear tabla en BD para respuestas de NanoEncuestaBC
- [x] Integrar guardado de respuestas en base de datos
- [x] Agregar enlace desde página principal a NanoEncuestaBC
- [x] Crear página de agradecimiento post-NanoEncuestaBC
- [x] Agregar validación obligatoria en NanoEncuestaBC - todas las preguntas requeridas antes de enviar

## Reorganización de Líderes - COMPLETADO
- [x] Mover botón PDF a sección Compartir Resultados
- [x] Crear vista SQL ranking_lideres_por_partido
- [x] Actualizar pdfExportLeaders para usar la nueva vista (pdfExportLeadersV3.ts)
- [x] Integrar compartir resultados directamente en botón (ShareLeadersModalSimple.tsx)
- [x] Actualizar URL en infografía a https://encuestabc-6q57y6uz.manus.space/
- [x] Compartir Resultados ahora abre modal sin sección propia
- [x] Mover botones PDF y Compartir al header
- [x] Restaurar botones PDF y Compartir en TODOS los tabs
- [x] Arreglar PDF e infografía para consultar ranking_lideres_por_partido
- [x] Simplificar infografía (LeadersInfographicSimple.tsx)
- [x] PDF e infografía funcionan correctamente

## Actualización de Provincias - NUEVO
- [x] Actualizar lista de provincias en surveyData.ts (52 provincias completas)
- [x] Verificar que Encuesta y NanoEncuesta muestren todas las provincias
- [x] Guardar checkpoint con provincias actualizadas

## Nuevas Secciones de Resultados por CCAA y Provincias - NUEVO
- [x] Crear vista SQL para resultados de voto_generales por CCAA
- [x] Crear vista SQL para resultados de voto_autonomicas por CCAA
- [x] Crear vista SQL para resultados de voto_municipales por Provincia
- [x] Crear componentes de visualización para CCAA (gráficos y tablas)
- [x] Crear componentes de visualización para Provincias (gráficos y tablas)
- [x] Integrar secciones en página de Resultados (debajo de generales)
- [x] Verificar que los datos se carguen correctamente en vivo
- [x] Guardar checkpoint con nuevas secciones

## Análisis de CCAA - Generales vs Autónomicas - NUEVO
- [x] Agregar botones para cambiar entre análisis de voto_generales y voto_autonomicas
- [x] Crear vista SQL para votos_autonomicas_por_ccaa si no existe
- [x] Modificar componente CCAAResltsSection para soportar ambos análisis
- [x] Verificar que los datos se carguen correctamente
- [x] Guardar checkpoint con análisis de CCAA mejorado

## Colores y Logos de Partidos Políticos - NUEVO
- [x] Crear archivo de configuración con colores y logos de partidos
- [x] Modificar CCAAResltsSection para usar colores y logos en gráficas
- [x] Modificar ProvincesResultsSection para usar colores y logos en gráficas
- [x] Verificar visualización correcta de colores y logos
- [x] Guardar checkpoint con colores y logos de partidos

## Reorganización de Botones de Navegación - NUEVO
- [x] Mover CCAA y Provincias al lado de Elecciones Generales
- [x] Verificar nuevo orden de botones
- [x] Guardar checkpoint con nuevo orden

## Vista de Comparación de CCAA - NUEVO
- [x] Crear componente CCAAComparisonSection
- [x] Agregar selector de 2-3 CCAA
- [x] Crear gráficas comparativas de votos
- [x] Agregar tabla comparativa de datos
- [x] Integrar en Results.tsx
- [x] Agregar botón de navegación
- [x] Verificar funcionamiento
- [x] Guardar checkpoint con comparación de CCAA

## Mapa Interactivo y Hemiciclo - NUEVO
- [x] Implementar cálculo de Ley d'Hondt por provincia (no nacional)
- [x] Crear mapa interactivo de provincias coloreado por partido ganador
- [x] Crear visualización de hemiciclo con 350 escaños distribuidos
- [x] Integrar mapa y hemiciclo en sección separada
- [x] Agregar interactividad: click en provincia para detalles
- [x] Agregar hover en escaños del hemiciclo para ver partido
- [x] Crear vista SQL votos_por_provincia_view
- [x] Agregar figura de "Datos no disponibles" en gris
- [x] Escaños no disponibles ocupan espacio hasta que haya datos
- [x] Agregar enlace a nano-encuesta en el mapa
- [x] Verificar funcionamiento correcto
