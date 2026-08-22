# Validación — Comparación de candidatos, Excel y transición del Sankey

Fecha de comprobación: 22 de agosto de 2026.

El modal ofrece el selector de comparación y carga el historial del candidato elegido junto a la evolución principal; cuando el candidato comparado no tiene registros históricos suficientes, la serie queda en cero en lugar de inventar valores. La exportación Excel generó correctamente el archivo `transferencia_voto_GLOBAL_ALL.xls`. Al cambiar el rango de fechas, el contenedor del Sankey aplica la animación `sankey-recalculate`, verificada a través de su estilo computado.
