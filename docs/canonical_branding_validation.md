# Validación reproducible de branding y líderes canónicos

Fecha de comprobación: 22 de agosto de 2026.

| Comprobación | Resultado observado |
|---|---|
| `party_configuration` | La consulta pública devolvió 77 partidos activos; ninguno tenía `logo_url` vacío. |
| `party_leaders` | La consulta pública devolvió 86 líderes activos y todos referenciaban una `party_key` activa. |
| NanoEncuesta, PP | Al seleccionar PP se mostró exactamente el `logo_url` de `party_configuration` para PP. La consulta de `party_leaders` devolvió únicamente diez líderes activos con `party_key = 'PP'`. |
| Top 5 | La agregación directa de `valoraciones_lideres` coincidió campo a campo con `fetchLeaderRanking()`: Miriam González (D21, 9,6667, 3), Ignacio Dancausa (PP, 9,5, 4), Javi Martínez Onsalo (VOX, 9,5, 4), La Marrash (PODEMOS, 9,5, 2) y Javi Domínguez (PP, 9,3333, 3). |
| Color inválido | `#00000` se normaliza a `#000000` para evitar el fallo de Canvas, sin cambiar el partido, su nombre o su logotipo. |
| Recursos de imagen | Se probaron 163 URL en el navegador: 77 logotipos y 86 fotos configuradas. Cargaron 161; las dos fotos externas que no cargaron fueron Alicia Sanz (Frente Obrero, LinkedIn) y Lucas González (Se Acabó La Fiesta, Instagram). |

El código no vuelve a utilizar colores ni logotipos procedentes de vistas electorales cuando puede resolver el partido desde `party_configuration`. Los datos electorales solo aportan votos y referencias de partido. La selección de líder de NanoEncuesta guarda a partir de esta corrección la `party_key` canónica en `lideres_preferidos`.

NanoEncuesta carga ahora directamente la `photo_url` de `party_leaders`, incluso cuando el origen sea X u otro CDN. Solo si esa URL falla de verdad muestra iniciales del mismo líder; no recurre a un catálogo estático o a una persona diferente. Las dos URL externas fallidas deberán sustituirse en `party_leaders.photo_url` por enlaces de imagen públicos y persistentes para recuperar sus retratos.

La comprobación móvil de Resultados mostró el Top 5 completo, las cinco puntuaciones y las tarjetas de partido sin solapamientos en un viewport de 390 × 844 px.
