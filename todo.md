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
- [x] Integrar compartir resultados directamente en botón (ShareLeadersModal.tsx)
- [x] Actualizar URL en infografía a https://encuestabc-6q57y6uz.manus.space/
- [x] Compartir Resultados ahora abre modal sin sección propia
- [x] Mover botones PDF y Compartir al header
- [x] Restaurar botones PDF y Compartir en TODOS los tabs (Elecciones, Asociaciones, Lideres)
- [x] Arreglar PDF e infografía para consultar ranking_lideres_por_partido
- [x] PDF e infografía funcionan correctamente con datos de la vista
