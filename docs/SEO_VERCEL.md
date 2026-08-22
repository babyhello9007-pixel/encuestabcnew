# SEO al desplegar en Vercel

La aplicación calcula de forma automática la URL canónica, Open Graph y los datos estructurados desde el dominio con el que se está visitando. Para fijar el dominio público definitivo en compilaciones de Vercel, crea la variable de entorno **`VITE_SITE_URL`** con la URL HTTPS final, sin barra final; por ejemplo, `https://tu-dominio.vercel.app` o tu dominio propio.

Después del despliegue, sustituye en `client/public/robots.txt` y `client/public/sitemap.xml` el dominio temporal de Manus por ese mismo dominio. Registra entonces `https://tu-dominio/sitemap.xml` en Google Search Console. El componente de portada no necesita una clave de X: utiliza el widget oficial para cronologías públicas y ofrece un enlace alternativo si el widget se bloquea.
