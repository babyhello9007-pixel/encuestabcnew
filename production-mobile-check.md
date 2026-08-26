# Verificación de producción — 26/08/2026

La URL publicada `https://encuestabc-6q57y6uz.manus.space/resultados` ya carga correctamente la versión nueva. En la vista publicada se confirmaron los controles **Infografía**, **PDF**, **Filtros**, **Top 5**, **Compartir** y **Exportar PNG**, además de los resultados electorales visibles.

Se abrió el control **Filtros** en producción y el panel respondió correctamente: cambió a «Ocultar», mostró los selectores de comunidad, provincia y edad y mostró los botones de exportación CSV y Excel. El contenido accesible también reflejó «Filtros avanzados abiertos». La comprobación inicial de pantalla en blanco correspondía a la versión anterior antes de publicar el checkpoint; queda sustituida por esta verificación positiva.

Durante la verificación posterior se intentó activar **Top 5**; el navegador mantuvo Filtros abiertos y una interacción por coordenadas abrió accidentalmente el modal de Infografía. Esto indica que la comprobación por coordenadas no es fiable en este viewport anotado; no se ha considerado un fallo del botón. El modal queda pendiente de cerrar correctamente y la comprobación del Top 5 se repetirá mediante el índice accesible del botón o desde una recarga limpia.

Tras cerrar correctamente el modal de Infografía, se pulsó el botón **Filtros** en producción y el panel pasó a «Mostrar»; el contenido del formulario desapareció y el anuncio accesible pasó a «Panel cerrado». La interacción por índice funcionó correctamente. El siguiente paso de la comprobación es abrir Top 5 con Filtros cerrado.

Con Filtros cerrado, el botón **Top 5** se abrió correctamente en producción. El panel mostró «Top 5 de líderes abierto», sus cinco tarjetas interactivas y los tooltips accesibles de desglose para Albert Rivera, Ester Muñoz, Isabel Díaz Ayuso, Javi Domínguez y Jon González. Esta comprobación confirma el flujo de apertura/cierre de ambos paneles y la presencia de los tooltips en la versión publicada.
