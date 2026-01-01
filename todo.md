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
- [x] Pregunta 20 de líderes integrada en NanoEncuestaBC (enviando a lideres_preferidos)

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

## Personalización de Colores en Infografías - COMPLETADO
- [x] Crear sistema de temas de colores (Claro, Oscuro, Corporativo)
- [x] Agregar selector de tema en modal de compartir
- [x] Asegurar que el recuadro de escaños sea visible en todos los temas
- [x] Cambiar recuadro de escaños a fondo rojo con texto blanco
- [x] Probar descarga PNG con diferentes temas
- [x] Verificar que todos los elementos sean visibles en descarga

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

## ShareResultsAdvanced - Modos Individual/Completo - NUEVO
- [x] Agregar selector de modos Individual/Completo
- [x] Modo Individual: infografía de partido seleccionado
- [x] Modo Completo: infografía con top 10 partidos
- [x] Agregar botones de X, Bluesky y Discord
- [x] Mejorar ImageLoader para carga forzada de logos
- [x] Búsqueda exhaustiva en EMBEDDED_LOGOS
- [x] Descarga de PNG en alta resolución (1920x1080)

## Bug Fix - Error OKLCH en html2canvas
- [x] Identificar elementos con colores OKLCH en ShareResultsAdvanced
- [x] Reemplazar colores OKLCH con RGB/HEX en infografías
- [x] Probar descarga de PNG sin errores
- [x] Guardar checkpoint final

## Mejoras de Compartir - Sesión Nov 29
- [x] Agregar número de escaños en infografías (Individual y Completo)
- [x] Mostrar imagen en selector de compartir (X, Bluesky, Discord)
- [x] Vista previa de infografía antes de compartir
- [x] Probar en todos los modos (Individual, Completo, Líderes)

## Página Bio (Linktree) - NUEVO
- [x] Crear página Bio.tsx con diseño Linktree
- [x] Agregar logo de Batalla Cultural
- [x] Agregar enlace a Versión Rápida (NanoEncuestaBC)
- [x] Agregar enlace a Resultados En Vivo
- [x] Agregar enlaces a Redes Sociales (X, Discord, Bluesky, Instagram)
- [x] Integrar ruta /bio en App.tsx
- [x] Probar página Bio en navegado- [x] Guardar checkpoint final con página Bio

## Mejoras del Pactómetro - Nueva Sesión
- [x] Mover Pactometer de Generales a Mapa y Hemiciclo
- [x] Hacer Pactometer interactivo con nombres de partidos y clics para pactos
- [x] Mejorar paleta de colores de partidos políticosBlog de BC - NUEVO
- [x] Crear tabla blog_posts en Supabase
- [x] Crear procedimi...tos tRPC para blog (crear, editar, eliminar, obtener)
- [x] Crear página pública /blog con listado de entradas
- [x] Crear panel de administración /admin/blog
- [x] Agregar enlace "El Blog de BC" en página Bio
- [x] Agregar rutas /blog y /admin/blog en App.tsx
- [x] Probar funcionalidades del blog
- [x] Guardar checkpoint con sistema de blog


## Autenticación Discord para Admin Blog - NUEVO
- [x] Obtener ID del servidor Discord de Batalla Cultural
- [x] Obtener ID del rol "Escritores" en Discord
- [x] Configurar Discord OAuth en la aplicación
- [x] Implementar verificación de membresía en servidor Discord
- [x] Implementar verificación de rol "Escritores"
- [x] Crear página de login Discord para /admin/blog
- [x] Proteger rutas del admin con verificación Discord
- [x] Probar flujo completo de autenticación

## Bug Fix - Elementos Duplicados en Resultados - NUEVO
- [x] Corregir elementos duplicados en la página de resultados (partidos con 0 votos aparecen duplicados)

## Mejora de Campo "Otros" en NanoEncuestaBC - NUEVO
- [x] Mejorar lógica de handleOtroAnswer para limpiar el estado cuando se deselecciona "Otro"
- [x] Crear función handleSelectChange para manejar correctamente la selección de "Otro"
- [x] Cuando se selecciona "Otro": mostrar input de texto y limpiar el campo
- [x] Cuando se deselecciona "Otro": ocultar input y guardar la nueva opción
- [x] Probar funcionamiento en navegador

## Actualización de Colores de Partidos Políticos - NUEVO
- [x] Actualizar colores de todos los partidos en partyConfig.ts
- [x] Agregar colores para partidos con 0 escaños (PACMA, CUP, Adelante Andalucía, etc.)
- [x] Mejorar función getPartyConfig para búsqueda por coincidencia parcial
- [x] Verificar que el mapa muestre los colores correctos de cada partido


## BUGS REPORTADOS - URGENTE
- [x] Error "NotFoundError: removeChild" en versión publicada (UE) - CORREGIDO en TwitterFeed.tsx
- [x] Error de verificación de rol en Discord OAuth para admin/blog - CORREGIDO: Configurado DISCORD_BOT_TOKEN

## Corrección de Distribución de Escaños para Asociaciones Juveniles - NUEVO
- [x] Actualizar tabla de escaños por provincia para Asociaciones Juveniles (100 escaños totales)
- [x] Asignar 5 escaños específicamente a Salamanca
- [x] Implementar Ley d'Hondt con umbral del 4% para Asociaciones Juveniles
- [x] Verificar que el cálculo de escaños sea correcto
- [x] Guardar checkpoint con corrección de escaños para Asociaciones Juveniles


## URGENTE: Corrección de Visualización de Escaños en Mapas - CRÍTICO
- [x] Investigar por qué ProvincePopup no muestra escaños (solo votos)
- [x] Corregir componente ProvincePopup para calcular y mostrar escaños por partido
- [x] Verificar que SpainMapRealistic/SpainMapProvincial pasen datos de escaños
- [x] Corregir mapa de Elecciones Generales (mostrar escaños en popup)
- [x] Corregir mapa de Asociaciones Juveniles (mostrar escaños en popup)
- [x] Probar ambos mapas: click en provincia debe mostrar votos Y escaños

## Corrección de Escaños de Asociaciones Juveniles - COMPLETADO
- [x] Investigar problema de distribución de 350 escaños en lugar de 100
- [x] Agregar prop isYouthAssociations a SpainMapRealistic.tsx
- [x] Modificar handleProvinceClick para usar función correcta según tipo
- [x] Actualizar Results.tsx para pasar isYouthAssociations={true} al mapa juvenil
- [x] Verificar que Asociaciones Juveniles distribuya 100 escaños correctamente
- [x] Actualizar distribución de circunscripciones: Salamanca 7, todas las provincias mínimo 1 escaño
- [x] Agregar prop isYouthAssociations a SpainMapProvincial.tsx
- [x] Actualizar Results.tsx para pasar isYouthAssociations={true} al mapa esquemático
- [x] Verificar que ambos mapas (esquemático y realista) distribuyan 100 escaños
- [x] Guardar checkpoint con corrección de escaños juveniles y circunscripciones


## Bug Fix - Escaños Incorrectos en Popup del Mapa de Asociaciones Juveniles - COMPLETADO
- [x] Identificar que SpainMapRealistic.tsx usaba calcularEscanosProvincia() siempre (línea 148)
- [x] Corregir línea 148 para usar isYouthAssociations y seleccionar función correcta
- [x] Verificar que popup de Salamanca muestre 7 escaños correctamente
- [x] Verificar que popup de Asociaciones Juveniles distribuya 100 escaños correctamente


## Agregar Botones de Ordenamiento en Asociaciones Juveniles - COMPLETADO
- [x] Agregar estado sortBy en Results.tsx para Asociaciones Juveniles
- [x] Crear botones "Votos" y "Escaños" en sección de Asociaciones
- [x] Implementar lógica de ordenamiento por votos y escaños
- [x] Mantener consistencia visual con botones de Elecciones Generales

## Sugerencias de Mejoras Futuras
- [ ] Agregar análisis de segmentación demográfica por provincia (edad e ideología)
- [ ] Implementar sistema de notificaciones para cambios significativos en resultados
- [ ] Crear página de comparativa histórica si hay datos de encuestas anteriores
- [ ] Agregar filtros avanzados en página de resultados (por CCAA, provincia, rango de edad)
- [ ] Implementar exportación de datos en Excel/CSV con análisis detallados
- [ ] Crear dashboard de administrador con estadísticas de participación

## Integración de Líderes en NanoEncuestaBC - NUEVO
- [ ] Agregar pregunta 20 de valoración de líderes en NanoEncuestaBC
- [ ] Filtrar líderes según partido votado en Elecciones Generales
- [ ] Mostrar solo líderes relevantes del partido seleccionado
- [ ] Mantener página original de líderes (/lideres) sin cambios
- [ ] Guardar checkpoint con integración de líderes


## Tareas Nuevas - Enero 2026
- [x] Eliminar PARTIDO NACIONAL ALONSISTA de la encuesta
- [ ] Forzar visualización de TODOS los logos de partidos (no emojis)
- [x] Mejorar opción de compartir resultados (infografía y PDF) - Agregadas opciones WhatsApp, Telegram, LinkedIn
- [x] Implementar correctamente tablas SQL de Encuestas Varias - Tablas encuestas_varias y respuestas_encuestas_varias creadas
- [x] Agregar pactómetros en Mapa y Hemiciclo - Componente Pactometer.tsx creado
- [x] Agregar pactómetros en Asociaciones Juveniles - Componente Pactometer.tsx reutilizable
- [x] Implementar mejoras visuales generales - Agregadas animaciones, sombras mejoradas y estilos suaves
- [ ] Implementar IA para análisis de resultados en tiempo real (FUTURO) - Documentado en ROADMAP.md

## Tareas de Mejora - Sesión Actual

- [x] Forzar logos de partidos - Modificar partyConfig.ts para usar logos reales en lugar de emojis
- [x] Integrar Pactometer en resultados - Agregar componente a secciones generales y asociaciones
- [x] Implementar API de encuestas varias - Crear endpoints /api/surveys/results y /api/surveys/submit


## API Endpoints de Encuestas Varias - COMPLETADO

### Endpoints Implementados:

#### GET /api/surveys/misc
- Obtiene todas las encuestas varias disponibles
- Respuesta: Array de encuestas ordenadas por número de pregunta

#### GET /api/surveys/misc/:questionNumber
- Obtiene una encuesta varia específica
- Parámetro: questionNumber (número de pregunta)
- Respuesta: Objeto de encuesta

#### GET /api/surveys/misc/results/:questionNumber
- Obtiene resultados de una encuesta varia específica
- Incluye: votos totales, porcentajes por opción
- Respuesta: Objeto con resultados y opciones

#### GET /api/surveys/misc/results
- Obtiene resultados de TODAS las encuestas varias
- Respuesta: Array de resultados con votos y porcentajes

#### POST /api/surveys/misc/submit
- Envía una respuesta a una encuesta varia
- Body: { questionNumber, selectedOption }
- Opciones válidas: O1, O2, OO
- Actualiza automáticamente contadores

#### POST /api/surveys/misc (Admin)
- Crea una nueva encuesta varia
- Body: { questionNumber, questionText, optionO1, optionO2, optionOO }

#### PUT /api/surveys/misc/:questionNumber (Admin)
- Actualiza una encuesta varia existente
- Body: { questionText?, optionO1?, optionO2?, optionOO? }

#### DELETE /api/surveys/misc/:questionNumber (Admin)
- Elimina una encuesta varia

### Base de Datos:
- Tabla: encuestas_varias
- Tabla: respuestas_encuestas_varias
- Campos: id, questionNumber, questionText, optionO1, optionO2, optionOO, votesO1, votesO2, votesOO


## Correcciones del Pactómetro - Segunda Sesión
- [x] Eliminar pactómetro de la pestaña "Elecciones Generales"
- [x] Arreglar pactómetro interactivo de "Mapa y Hemiciclo" para que funcione correctamente
- [x] Hacer interactivo el pactómetro de "Asociaciones Juveniles"

## Correcciones del Pactómetro - Tercera Sesión
- [x] Arreglar funcionalidad del pactómetro de Mapa y Hemiciclo (grid clickeable)
- [x] Filtrar solo partidos/asociaciones con escaños > 0 en ambos pactómetros


## Mejoras Solicitadas - NUEVA FASE
- [x] Reorganizar Mapa y Hemiciclo: Pactómetro debajo del Mapa
- [x] Agregar animaciones suaves al seleccionar partidos (transiciones en botones)
- [x] Crear tarjeta flotante de resumen de coalición en tiempo real (CoalitionSummaryCard.tsx)
- [x] Mostrar partidos seleccionados y total de escaños acumulados
- [x] Implementar sistema de guardar coaliciones favoritas (useSavedCoalitions hook)
- [x] Permitir comparar coaliciones guardadas (SavedCoalitionsPanel.tsx)
- [x] Optimizar SEO para visibilidad en Google (meta tags, sitemap.xml, robots.txt)
- [x] Mejorar diseño visual general (animaciones, tipografia, espaciado, profundidad en index.css)
- [x] Crear blog individual con rutas dinamicas blog/[id] (BlogPost.tsx)
- [x] Permitir compartir articulos de blog individuales (botones de compartir en redes)
- [x] Ocultar ruta /lideres (remover acceso publico)


## Mejoras Finales - FASE 2
- [x] Integrar CoalitionSummaryCard en PactometerInteractive (tarjeta flotante conectada)
- [x] Agregar filtro de búsqueda en SavedCoalitionsPanel (búsqueda por nombre/fecha)
- [x] Crear página de comparación de coaliciones (/coaliciones-comparar)
- [x] Mejorar visualización de Variación de Votaciones por Día (mejor con muchos partidos)
- [x] Eliminar "61 preguntas" de página Home
- [x] Cambiar deslizables por botones en NanoEncuestaBC
- [x] Verificar ruta /lideres oculta
- [x] Pruebas finales y verificación completa


## Reorganización del Pactómetro - SESIÓN ACTUAL
- [x] Anclar CoalitionSummaryCard a la derecha de PactometerInteractive
- [x] Reposicionar Pactómetro: Mapa → Pactómetro → Hemiciclo
- [x] Verificar visualización correcta en todos los dispositivos
- [x] Hacer que CoalitionSummaryCard ocupe toda la altura disponible
