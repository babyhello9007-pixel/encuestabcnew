# Validación visual intermedia

- Results en escritorio y móvil muestra el panel de filtros, los selectores y los botones CSV/Excel sin solapamientos.
- La tipografía TVP está aplicada, pero las etiquetas muy pequeñas de Results siguen necesitando una última revisión de escala.
- El dashboard `/admin/estadisticas` carga métricas Supabase reales y el layout móvil apila las tarjetas correctamente.
- En móvil, las métricas coloreadas del dashboard tienen contraste insuficiente sobre el fondo claro porque usan clases `text-*-100`; deben pasar a tonos oscuros legibles.
- La comparativa histórica mantiene el estado vacío cuando no hay filas, evitando datos simulados.
