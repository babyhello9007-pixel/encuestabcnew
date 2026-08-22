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

Tras retirar los props de branding heredados, se verificó en Resultados el montaje de Provincia y el detalle de CCAA. La tabla de Andalucía mostró NÚCLEO NACIONAL, ADELANTE ANDALUCÍA, Se Acabó la Fiesta, VOX y PP con los nombres, colores y logotipos resueltos desde `party_configuration`; no se produjo ningún error de hooks.

Preguntas Varias se abrió con datos reales y mostró el desglose de «República» con ERC, Se Acabó la Fiesta, VOX, Frente Obrero, PSOE y SUMAR. Cada tarjeta tomó su nombre visible, color y logotipo del índice de `party_configuration`; los componentes no reciben ya `partyMeta` desde Resultados.

## Reproducción abierta de logotipos antiguos

El 22 de agosto se volvió a abrir Resultados tras el aviso de persistencia. La pantalla principal mostró URL de `party_configuration` para PP, PSOE, VOX, ERC, Se Acabó la Fiesta, UPN y Aliança Catalana. La auditoría de DOM contrastó 22 logos visibles de tarjetas: los 22 coincidieron exactamente con `party_configuration.logo_url`.

En Preguntas Varias se encontró una ruta visual heredada real: `ImageLoader` convertía `src` externos en logos embebidos aun cuando `PartyLogo` recibía `strictExternal`. El modo estricto se propagó al cargador y deja de exigir `crossOrigin="anonymous"`, de modo que los `logo_url` de la tabla se renderizan directamente. Se verificó que `Frente Amplio` y `Abstención - Ninguno` son filas activas de la tabla y que sus URL —respectivamente `iuleon.org/.../triangulo.png` y el icono de Flaticon— proceden de la configuración canónica actual, no de un catálogo cliente.

La validación final en pantalla montó las tres secciones afectadas desde Results.tsx. CCAA mostró Andalucía y su detalle por partido; Preguntas Varias mostró los desgloses reales de forma del Estado, territorial y pensiones; y Provincia mostró la tabla de Sevilla. En la tabla provincial, las tres imágenes visibles (VOX, Falange y Se Acabó la Fiesta) se compararon directamente con los `logo_url` activos de `party_configuration`: las tres coincidieron y no quedó ninguna URL visual no canónica.
