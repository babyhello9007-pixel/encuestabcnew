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
- [x] Mejorar paleta de colores para mejor contraste y visibilidad (COMPLETADO)
- [x] Optimizar responsividad en diferentes dispositivos (COMPLETADO)
- [x] Agregar documentación de uso en página "Acerca de"

## Conversión a Full-Stack - NUEVO
- [x] Convertir proyecto a full-stack con servidor backend
- [x] Integrar base de datos Supabase con tablas de partidos y asociaciones
- [x] Agregar logo_path a tablas de partidos_generales y asociaciones_juveniles
- [x] Mostrar logotipos correctamente en página de resultados desde BD (PRIORITARIO)
- [x] Adaptar tarjetas de líderes políticos a las imágenes y mostrar todas (PRIORITARIO)
- [x] Crear panel de administrador para gestión de archivos
- [x] Implementar función de carga de archivos a S3
- [x] Crear interfaz de explorador de archivos para admin
- [x] Editor de código con Monaco Editor
- [x] Permitir editar archivos del proyecto desde admin (main.tsx, etc.)
- [x] Crear editor de código que acceda a archivos reales del proyecto
- [x] Implementar lectura de archivos del proyecto (client/src, server, drizzle, etc.)
- [x] Implementar edición y guardado de archivos reales
- [x] Agregar previsualización de cambios antes de guardar

## Pruebas y Optimización
- [x] Pruebas funcionales de la encuesta (COMPLETADO)
- [x] Pruebas de envío de datos a Supabase (COMPLETADO)
- [x] Pruebas de visualización de resultados (COMPLETADO)
- [x] Optimización de rendimiento (COMPLETADO)
- [x] Pruebas de responsividad en diferentes dispositivos (COMPLETADO)

## Despliegue
- [x] Preparar para publicación (COMPLETADO)
- [x] Crear checkpoint final (COMPLETADO)
- [x] Documentación de uso (COMPLETADO)



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


## Mejora de Visualización de Provincias sin Datos - COMPLETADO
- [x] Mostrar todas las provincias en el mapa (incluyendo sin datos)
- [x] Diferenciar visualmente provincias sin datos en el mapa (gris, opacidad, "?")
- [x] Mejorar visualización de escaños sin asignar en hemiciclo (gris, pulsante)
- [x] Agregar leyenda para provincias sin datos
- [x] Agregar información de escaños asignados vs sin asignar

## Normalización de Nombres de Provincias Vascas - COMPLETADO
- [x] Crear función de normalización de provincias (Vizcaya → Bizkaia, Guipúzcoa → Gipuzkoa)
- [x] Aplicar normalización al enviar datos de Survey.tsx
- [x] Aplicar normalización al enviar datos de NanoEncuestaBC.tsx
- [x] Crear tests unitarios para la función de normalización
- [x] Verificar que los tests pasen correctamente

## Ley d'Hondt por Provincias en Elecciones Generales - COMPLETADO
- [x] Revisar cálculo actual de Elecciones Generales (nacional vs provincial)
- [x] Modificar GeneralElectionsSection para usar cálculo por provincias
- [x] Verificar que los escaños se distribuyan correctamente
- [x] Actualizar gráficas y tablas con nuevos datos
- [x] Guardar checkpoint con Ley d'Hondt por provincias

## Corrección de Diferencias Hemiciclo vs Elecciones Generales - COMPLETADO
- [x] Investigar diferencias entre hemiciclo y Elecciones Generales
- [x] Identificar fuente del problema en los cálculos
- [x] Sincronizar lógica de cálculo entre ambos
- [x] Verificar que muestren los mismos números (ahora ambos muestran: VOX 152, PP 70, Ciudadanos 36, PSOE 27, etc.)
- [x] Guardar checkpoint con correcciones

## Mejora de Visualización Hemiciclo por Provincia - COMPLETADO
- [x] Agregar estado para provincia seleccionada en Results.tsx
- [x] Modificar hemiciclo para mostrar votos y escaños de provincia seleccionada
- [x] Actualizar mapa para pasar provincia seleccionada al hemiciclo
- [x] Verificar que la visualización funcione correctamente
- [x] Guardar checkpoint con mejoras (v: ef13bca0)


## Corrección de Cálculo de Escaños por Provincia - COMPLETADO
- [x] Crear tabla escanos_provincias en BD con distribución real de escaños
- [x] Crear función de Ley d'Hondt que respete escaños asignados a cada provincia
- [x] Actualizar SpainMapProvincial para usar escaños correctos de la BD
- [x] Actualizar ParliamentHemicycle para mostrar escaños correctos
- [x] Verificar que los cálculos sean correctos con datos reales
- [x] Guardar checkpoint con corrección de escaños (v: b9557385)


## Verificador de Escaños por Provincia - COMPLETADO
- [x] Crear vista SQL para calcular escaños por provincia
- [x] Crear función para comparar escaños calculados vs esperados
- [x] Agregar botón de verificación en SpainMapProvincial
- [x] Crear modal de resultados de verificación
- [x] Verificar que la verificación funcione correctamente
- [x] Guardar checkpoint con verificador de escaños (v: b537b072)


## Mejoras Visuales: Hemiciclo, Mapa y Ordenamiento - COMPLETADO
- [x] Crear hemiciclo con forma real de parlamento
- [x] Agregar botón para alternar entre mapa grid y mapa realista
- [x] Implementar mapa realista de España
- [x] Agregar ordenamiento por votos/escaños en Elecciones Generales
- [x] Verificar que todas las vistas funcionen correctamente
- [x] Guardar checkpoint con mejoras visuales

## Hemiciclo Semicircular Real del Congreso Español - COMPLETADO
- [x] Crear hemiciclo semicircular real del Congreso de Diputados
- [x] Implementar distribución de escaños en arcos concéntricos
- [x] Agregar interactividad (hover) en escaños
- [x] Verificar visualización del hemiciclo
- [x] Guardar checkpoint con hemiciclo real

## Mejora del Mapa Realista - Formas Reales de Provincias - COMPLETADO
- [x] Obtener GeoJSON de provincias españolas con límites reales
- [x] Normalizar nombres: A Coruña ↔ Coruña, Bizkaia ↔ Vizcaya, Gipuzkoa ↔ Guipúzcoa
- [x] Agregar Islas Baleares (Illes Balears), Canarias (Las Palmas, Santa Cruz de Tenerife), Ceuta y Melilla
- [x] Crear mapeo entre nombres de provincias y GeoJSON
- [x] Reemplazar cuadrados por polígonos reales en SpainMapRealistic
- [x] Probar mapa completo en navegador
- [x] Guardar checkpoint final con mapa realista mejorado

## Mejora de Popup y Filtros Dinamicos del Mapa - COMPLETADO
- [x] Crear componente ProvincePopup con todos los resultados de la provincia
- [x] Mostrar top 10 partidos con votos, porcentajes y barras de progreso
- [x] Agregar edad promedio e ideologia promedio en popup
- [x] Crear componente MapFilters con filtros dinamicos
- [x] Implementar filtro por rango de edad (18-80 anos)
- [x] Implementar filtro por rango de ideologia (1-10)
- [x] Implementar filtro por partidos seleccionados
- [x] Cargar metricas por provincia (edad y ideologia promedio)
- [x] Integrar filtros en SpainMapRealistic
- [x] Aplicar filtros visualmente (provincias que no coinciden en gris)
- [x] Mostrar leyenda de filtros activos
- [x] Eliminar filtros del mapa realista que no funcionaban
- [x] Aumentar tamaño del mapa (de h-96 a h-[600px])
- [x] Reducir espacios y padding para dar más espacio al mapa

## Redes Sociales en Footer - NUEVO
- [x] Crear componente Footer reutilizable con enlaces de redes sociales
- [x] Agregar enlace a X: https://x.com/bcultural_es
- [x] Agregar enlace a Discord: https://discord.gg/Tc8JabgY3T
- [x] Agregar enlace a Bluesky: https://bsky.app/profile/bcultural-es.bsky.social
- [x] Agregar enlace a Instagram: https://www.instagram.com/bcultural_es/
- [x] Integrar footer en página Home
- [x] Integrar footer en página Survey
- [x] Integrar footer en página NanoEncuestaBC
- [x] Integrar footer en página Results
- [x] Integrar footer en página About
- [x] Integrar footer en página LeaderSurvey
- [x] Verificar que todos los enlaces funcionen correctamente
- [x] Guardar checkpoint con redes sociales en footer

## Menú "Síguenos" en Header - NUEVO
- [x] Copiar logos PNG reales a assets/icons (x-logo.png, discord-logo.png, bluesky-logo.png, instagram-logo.gif)
- [x] Crear componente FollowUsMenu con desplegable y logos
- [x] Integrar FollowUsMenu en header de Home.tsx
- [x] Integrar FollowUsMenu en header de Results.tsx
- [x] Implementar fallbacks robustos para carga de logos
- [x] Forzar carga de logos con loading="eager" y decoding="sync"

## Mejora de Sección de Compartir - NUEVO
- [x] Mejorar visualmente el menú "Síguenos" con diseño premium
- [x] Rediseñar infografía con liquid glass para Elecciones Generales
- [x] Rediseñar infografía con liquid glass para Asociaciones Juveniles
- [x] Agregar funcionalidad de compartir en Líderes Preferidos
- [x] Actualizar textos y elementos de compartir
- [x] Usar logos de partidos desde código existente (sin tocar)
- [x] Usar logos de asociaciones desde código existente (sin tocar)
